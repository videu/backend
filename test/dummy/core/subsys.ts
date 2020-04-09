/**
 * Stub subsystem implementations.
 * @packageDocumentation
 *
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

import { IObjectSchema } from '../../../types/util/object-schema';

import {
    AbstractSubsys,
    AbstractSubsysConfigurable,
} from '../../../src/core/abstract-subsys';

/**
 * Dummy implementation of a subsystem for testing the
 * {@linkcode AbstractSubsys} class.
 */
export class StubSubsys<InitParams extends any[] = []>
extends AbstractSubsys<InitParams> {

    /** The error message of errors thrown in {@linkcode .onInit}. */
    public static INIT_ERROR_MESSAGE: string = 'Dummy init failed :(';
    /** The error message of errors thrown in {@linkcode .onExit}. */
    public static EXIT_ERROR_MESSAGE: string = 'Dummy exit failed :(';

    /** The parameters passed to the {@linkcode .onInit} callback. */
    public initParams: InitParams | null = null;

    private readonly shouldInitFail: boolean;
    private readonly shouldExitFail: boolean;

    constructor(id: string, shouldInitFail: boolean, shouldExitFail: boolean) {
        super(id);

        this.shouldInitFail = shouldInitFail;
        this.shouldExitFail = shouldExitFail;
    }

    public onInit(...params: InitParams): Promise<void> {
        /*
         * Returning a Promise manually instead of declaring init() as async
         * allows us to use timeouts.  This simulates the actual delay that may
         * occur with things like connecting to a server.
         */
        return new Promise(async (resolve, reject) => {
            this.initParams = params;

            setTimeout(() => {
                if (this.shouldInitFail) {
                    reject(new Error(StubSubsys.INIT_ERROR_MESSAGE));
                } else {
                    resolve();
                }
            }, 5);
        });
    }

    public async onExit() {
        if (this.shouldExitFail) {
            throw new Error(StubSubsys.EXIT_ERROR_MESSAGE);
        }
    }

}

/**
 * Configuration schema for the {@linkcode StubSubsysConfigurable} class.
 */
export interface IStubSubsysConfig {
    someProp: string;
}

/**
 * Dummy subsystem w/ config for testing the
 * {@linkcode AbstractSubsysConfigurable} class.
 */
export class StubSubsysConfigurable<InitParams extends any[] = []>
extends AbstractSubsysConfigurable<IStubSubsysConfig, InitParams> {

    /** The configuration object that is passed to the super class. */
    public static readonly CONFIG: IStubSubsysConfig = {
        someProp: 'some-val',
    };

    /** The config validation schema. */
    private static readonly SCHEMA: IObjectSchema = {
        someProp: {
            type: 'string',
        },
    };

    /** An array of all parameters passed to the {@linkcode .init} callback. */
    public initParams: InitParams | null = null;

    private readonly shouldInitFail: boolean;
    private readonly shouldExitFail: boolean;
    private readonly shouldConfigFail: boolean;

    /**
     * Create a new subsystem dummy.
     *
     * @param id The subsystem id.
     * @param wants All subsystem ids this one depends on.
     * @param shouldInitFail Whether the {@linkcode .init} callback should throw an error.
     * @param shouldExitFail Whether the {@linkcode .exit} callback should throw an error.
     * @param shouldConfigFail Whether the configuration should be invalid.
     */
    constructor(id: string, shouldInitFail: boolean = false, shouldExitFail: boolean = false,
                shouldConfigFail: boolean = false, configFromEnv: boolean = false) {
        super(
            id,
            shouldConfigFail && !configFromEnv
                ? {} as IStubSubsysConfig
                : configFromEnv
                    ? null
                    : StubSubsysConfigurable.CONFIG,
            StubSubsysConfigurable.SCHEMA
        );

        this.shouldInitFail = shouldInitFail;
        this.shouldExitFail = shouldExitFail;
        this.shouldConfigFail = shouldConfigFail;
    }

    public onInit(...params: InitParams): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await super.onInit(...params);
            } catch (err) {
                reject(err);
            }

            this.initParams = params;

            setTimeout(() => {
                if (this.shouldInitFail) {
                    reject(new Error(StubSubsys.INIT_ERROR_MESSAGE));
                } else {
                    resolve();
                }
            }, 5);
        });
    }

    public async onExit(): Promise<void> {
        if (this.shouldExitFail) {
            throw new Error(StubSubsys.EXIT_ERROR_MESSAGE);
        }
    }

    protected readConfigFromEnv(): IStubSubsysConfig {
        /*
         * This can only ever get called if configFromEnv is true as that is the
         * only way that the config parameter passed to the super constructor is
         * null.  That means we don't have to check that flag here.
         */
        if (this.shouldConfigFail) {
            return {} as IStubSubsysConfig;
        } else {
            return StubSubsysConfigurable.CONFIG;
        }
    }

}
