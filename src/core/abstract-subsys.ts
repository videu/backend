/**
 * @file Abstract base class for all subsystems.
 * @author Felix Kopp <sandtler@sandtler.club>
 *
 * @license
 * Copyright (c) 2020 The videu Project <videu@freetube.eu>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { IConfigurable } from '../../types/configurable';
import { LifecycleState } from '../../types/core/lifecycle';
import { ISubsys } from '../../types/core/subsys';
import { ILogger } from '../../types/logger';
import { IObjectSchema } from '../../types/util/object-schema';

import { IllegalAccessError } from '../error/illegal-access-error';
import { IllegalStateError } from '../error/illegal-state-error';
import { InvalidConfigError } from '../error/invalid-config-error';
import { Logger } from '../util/logger';
import { validateConfig } from '../util/validate';

/** Regular expression for validating a subsystem id. */
const subsysIdRegex: RegExp = /^[a-z]([a-z0-9\-]*[a-z0-9])?$/;

/**
 * Abstract base class for all subsystems.
 *
 * @param T The type of the configuration object.
 */
export abstract class AbstractSubsys<InitParams extends any[] = []>
implements ISubsys<InitParams> {

    /** @inheritdoc */
    public readonly id: string;

    /** The logging utility for this subsystem. */
    protected readonly logger: ILogger;

    /** Internal field for {@link #state} w/ write access. */
    private _state: LifecycleState = LifecycleState.CREATED;

    /**
     * Create a new subsystem.
     *
     * @param id This subsystem's unique id.  This should be an all-lowercase
     *     alphanumeric string starting with a letter and may contain dashes
     *     within.
     */
    constructor(id: string) {
        if (!subsysIdRegex.test(id)) {
            throw new Error(
                `Subsystem id "${id}" does not match ${subsysIdRegex.toString()}`
            );
        }

        this.id = id;
        this.logger = new Logger(id);
    }

    /** @inheritdoc */
    public get state(): LifecycleState {
        return this._state;
    }

    /** @inheritdoc */
    public async init(...initParams: InitParams) {
        if (this.state !== LifecycleState.CREATED) {
            throw new IllegalStateError(
                'Cannot initialize a subsystem that is not in CREATED state'
            );
        }

        try {
            await this.onInit(...initParams);
            this._state = LifecycleState.INITIALIZED;
        } catch (err) {
            this._state = LifecycleState.ERROR;
            throw err;
        }
    }

    /** @inheritdoc */
    public async exit() {
        if (this.state !== LifecycleState.INITIALIZED) {
            throw new IllegalStateError(
                'Cannot exit a subsystem that is not in initialized state'
            );
        }

        try {
            await this.onExit();
            this._state = LifecycleState.EXITED;
        } catch (err) {
            this._state = LifecycleState.ERROR;
            throw err;
        }
    }

    /**
     * Callback for doing all required initialization work.  This is called by
     * the {@link #init} method.  If it throws an error, the subsystem enters
     * the {@link LifecycleState#ERROR} state.
     *
     * @param initParams The initialization parameters.
     */
    protected abstract onInit(...initParams: InitParams): Promise<void>;

    /**
     * Callback for doing all required cleanup work on server stop.
     * This is called by the {@link #exit} method.
     */
    protected abstract onExit(): Promise<void>;

}

/**
 * Abstract base class for all subsystems that are configurable.
 */
export abstract class AbstractSubsysConfigurable<
    ConfigType extends object = {},
    InitParams extends any[] = []
> extends AbstractSubsys<InitParams> implements IConfigurable<ConfigType> {

    /** Internal field for {@link #config} w/ write access. */
    private _config: ConfigType | null;

    /** The validation schema for the config object. */
    private readonly configSchema: IObjectSchema;

    /**
     * Create a new configurable subsystem.
     *
     * @param id This subsystem's unique id.  This should be an all-lowercase
     *     alphanumeric string starting with a letter and may contain dashes
     *     within.
     * @param config The configuration object.  If `null`, the
     *     {@link #readConfigFromEnv} callback is invoked to obtain it.  If that
     *     returns `null` as well, an {@link InvalidConfigError} is thrown.
     * @param configSchema A schema describing the exact structure of the
     *     configuration object.
     * @throws An {@link InvalidConfigurationError} if the configuration
     *     had illegal or missing values.
     */
    constructor(id: string, config: ConfigType | null, configSchema: IObjectSchema) {
        super(id);

        this._config = config;
        this.configSchema = configSchema;
    }

    /** @inheritdoc */
    protected async onInit(...initParams: InitParams): Promise<void> {
        if (this._config === null) {
            this._config = validateConfig(this.readConfigFromEnv(), this.configSchema);
        } else {
            this._config = validateConfig(this._config, this.configSchema);
        }
    }

    /** @inheritdoc */
    public get config(): ConfigType {
        if (this._config === null) {
            throw new IllegalAccessError('Cannot access configuration before init()');
        }

        return this._config;
    }

    /**
     * Callback for reading the configuration object from environment variables.
     *
     * @return The configuration object, composed from environment variables.
     */
    protected abstract readConfigFromEnv(): ConfigType;

}
