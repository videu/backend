/**
 * @file Dummy implementation of `ISubsys`.
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

import { ISubsys } from '../../../types/core/subsys';
import { IVideu } from '../../../types/core/videu';

import { AbstractSubsys } from '../../../src/core/abstract-subsys';
import { IObjectSchema } from '../../../types/util/object-schema';

/**
 * Dummy implementation of a subsystem.
 */
export class StubSubsys implements ISubsys {

    public readonly id: string;

    public isInitialized: boolean = false;
    /** If `false`, the dependencies defined in {@link #wants} were not satisfied. */
    public hasDependenciesSatisfied: boolean =  true;

    public readonly wants: string[];

    private readonly shouldInitFail: boolean;
    private readonly shouldExitFail: boolean;

    /**
     * Create a new subsystem dummy.
     *
     * @param id The subsystem id.
     * @param wants All subsystem ids this one depends on.
     * @param shouldInitFail Whether the {@link #init} callback should throw an error.
     * @param shouldExitFail Whether the {@link #exit} callback should throw an error.
     */
    constructor(id: string, wants: string[], shouldInitFail: boolean, shouldExitFail: boolean) {
        this.id = id;
        this.wants = wants;
        this.shouldInitFail = shouldInitFail;
        this.shouldExitFail = shouldExitFail;
    }

    public init(videu: IVideu): Promise<void> {
        return new Promise((resolve, reject) => {
            /* check if all subsystems this one depends on have been initialized */
            for (const subsysId of this.wants) {
                const subsys = videu.getSubsys(subsysId);
                if (subsys === null || !subsys.isInitialized) {
                    this.hasDependenciesSatisfied = false;
                }
            }

            setTimeout(() => {
                this.isInitialized = true;
                if (this.shouldInitFail) {
                    reject(new Error('Dummy init failed :('));
                } else {
                    resolve();
                }
            }, 5);
        });
    }

    public exit(): void {
        this.isInitialized = false;
        if (this.shouldExitFail) {
            throw new Error('Dummy exit failed :(');
        }
    }

}

export interface IStubSubsysConfig {
    someProp: string;
}

/**
 * Dummy extending the {@link AbstractSubsys} class.
 */
export class StubExtAbstractSubsys
extends AbstractSubsys<IStubSubsysConfig> {

    public static readonly CONFIG: IStubSubsysConfig = {
        someProp: 'some-val',
    };

    private static readonly SCHEMA: IObjectSchema = {
        someProp: {
            type: 'string',
        },
    };

    /** If `false`, the dependencies defined in {@link #wants} were not satisfied. */
    public hasDependenciesSatisfied: boolean = true;

    public readonly wants: string[];

    private readonly shouldInitFail: boolean;
    private readonly shouldExitFail: boolean;

    /**
     * Create a new subsystem dummy.
     *
     * @param id The subsystem id.
     * @param wants All subsystem ids this one depends on.
     * @param shouldInitFail Whether the {@link #init} callback should throw an error.
     * @param shouldExitFail Whether the {@link #exit} callback should throw an error.
     * @param shouldConfigFail Whether the configuration should be invalid.
     */
    constructor(id: string, wants: string[], shouldInitFail: boolean = false,
                shouldExitFail: boolean = false, shouldConfigFail: boolean = false,
                configFromEnv: boolean = false) {
        super(
            id,
            shouldConfigFail
                ? {} as any
                : configFromEnv
                    ? null
                    : StubExtAbstractSubsys.CONFIG,
            StubExtAbstractSubsys.SCHEMA
        );

        this.wants = wants;
        this.shouldInitFail = shouldInitFail;
        this.shouldExitFail = shouldExitFail;
    }

    public getApp(): IVideu | null {
        return this.app;
    }

    public init(videu: IVideu): Promise<void> {
        return new Promise(async (resolve, reject) => {
            await super.init(videu);

            /* check if all subsystems this one depends on have been initialized */
            for (const subsysId of this.wants) {
                const subsys = videu.getSubsys(subsysId);
                if (subsys === null || !subsys.isInitialized) {
                    this.hasDependenciesSatisfied = false;
                }
            }

            setTimeout(() => {
                if (this.shouldInitFail) {
                    reject(new Error('Dummy init failed :('));
                } else {
                    resolve();
                }
            }, 5);
        });
    }

    public exit(): void {
        super.exit();

        if (this.shouldExitFail) {
            throw new Error('Dummy exit failed :(');
        }
    }

}

export class StubExtAbstractSubsysFromEnv extends StubExtAbstractSubsys {

    protected readConfigFromEnv(): IStubSubsysConfig {
        return StubExtAbstractSubsys.CONFIG;
    }

}
