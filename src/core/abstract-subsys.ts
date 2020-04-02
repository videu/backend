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
import { ISubsys } from '../../types/core/subsys';
import { IVideu } from '../../types/core/videu';
import { ILogger } from '../../types/logger';
import { IObjectSchema } from '../../types/util/object-schema';

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
export abstract class AbstractSubsys<T extends object>
implements ISubsys, IConfigurable<T> {

    /** @inheritdoc */
    public readonly id: string;

    /** @inheritdoc */
    public readonly config: T;

    /** @inheritdoc */
    public abstract readonly wants: string[];

    /** The main app instance. */
    protected get app(): IVideu | null {
        return this._app;
    }

    /** The logging utility for this subsystem. */
    protected readonly logger: ILogger;

    /**
     * Internal state memory of {@link #isInitialized} for keeping read-only
     * access to the cruel outside world.
     */
    private _isInitialized: boolean = false;

    /**
     * Internal value for {@link #app} with write access.
     */
    private _app: IVideu | null = null;

    /**
     * Create a new subsystem.
     *
     * @param id This subsystem's unique id.  This must be an all-lowercase
     *     alphanumeric string starting with a letter and may contain dashes
     *     within.
     * @param config The configuration object.  If `null`, the
     *     {@link #readConfigFromEnv} is invoked to obtain it.  If that returns
     *     `null` as well, an {@link InvalidConfigError} is thrown.
     * @param configSchema A schema describing the exact structure of the
     *     configuration object.
     * @throws An {@link InvalidConfigurationError} if the configuration
     *     had illegal or missing values.
     */
    constructor(id: string, config: T | null, configSchema: IObjectSchema) {
        if (!subsysIdRegex.test(id)) {
            throw new Error(
                `Subsystem id "${id}" does not match ${subsysIdRegex.toString()}`
            );
        }

        this.id = id;
        this.logger = new Logger(id);

        if (config === null) {
            const configFromEnv = this.readConfigFromEnv();

            if (configFromEnv === null) {
                throw new InvalidConfigError(
                    'Unable to obtain the configuration object'
                );
            }

            this.config = validateConfig(configFromEnv, configSchema);
        } else {
            this.config = validateConfig(config, configSchema);
        }
    }

    /** @inheritdoc */
    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    /** @inheritdoc */
    public async init(app: IVideu) {
        this._app = app;
        this._isInitialized = true;
    }

    /** @inheritdoc */
    public exit() {
        this._isInitialized = false;
    }

    /**
     * Callback for reading the configuration object from environment variables.
     * If you pass `null` as the `config` parameter in the constructor, you have
     * to override this method and return a non-`null` value.
     *
     * @return The configuration object, composed from environment variables.
     */
    protected readConfigFromEnv(): T | null {
        return null;
    }

}
