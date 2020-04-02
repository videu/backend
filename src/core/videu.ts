/**
 * @file Main app implementation.
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

import { ISubsys } from '../../types/core/subsys';
import { IVideu } from '../../types/core/videu';
import { ILogger } from '../../types/logger';

import { Logger } from '../util/logger';

/**
 * The main application class controlling all subsystems.
 */
export class Videu implements IVideu {

    /** A map of all subsystems by their id for faster access. */
    private subsysMap: {[key: string]: ISubsys} = {};

    /** A list of all subsystems in the order they must be initialized. */
    private subsystems: ISubsys[] = [];

    /** The logger for this class. */
    private logger: ILogger = new Logger('core');

    /**
     * Internal storage for keeping the public {@link isInitialized} getter
     * readonly while being able to change its value internally.
     */
    private _isInitialized: boolean = false;

    /**
     * Create a new application instance.
     * There should be at most one instance of this class per server.
     *
     * @param subsystems An array of all subsystems.
     */
    constructor(subsystems: ISubsys[]) {
        for (const subsys of subsystems) {
            if (typeof this.subsysMap[subsys.id] !== 'undefined') {
                throw new Error(
                    `Multiple subsystems with name "${subsys.id}" present`
                );
            }

            this.subsysMap[subsys.id] = subsys;
            this.subsystems.push(subsys);
        }

        for (const subsys of this.subsystems) {
            try {
                this.validateDependencies([subsys]);
            } catch (err) {
                this.logger.s('Cannot satisfy subsystem dependencies', err);
                throw err;
            }
        }

        this.arrangeSubsystems();
    }

    /** @inheritdoc */
    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    /** @inheritdoc */
    public getSubsys(id: string): ISubsys | null {
        const subsys: ISubsys | undefined = this.subsysMap[id];

        if (typeof subsys === 'undefined') {
            return null;
        } else {
            return subsys;
        }
    }

    /** @inheritdoc */
    public async init() {
        for (const subsys of this.subsystems) {
            this.logger.i(`Initializing subsystem "${subsys.id}"`);
            try {
                await subsys.init(this);
            } catch (err) {
                this.logger.s(
                    `Initialization of subsystem "${subsys.id}" failed`,
                    err
                );
                this.logger.s('Exiting due to fatal error');
                this.exit();
                throw err;
            }
        }

        this._isInitialized = true;
    }

    /** @inheritdoc */
    public exit() {
        /* reverse order to ensure dependencies are fulfilled */
        for (const subsys of this.subsystems.reverse()) {
            this.logger.i('Shutting down');

            if (!subsys.isInitialized) {
                continue;
            }

            try {
                subsys.exit();
            } catch (err) {
                this.logger.s(
                    `Unable to de-initialize subsystem "${subsys.id}"`,
                    err
                );
            }
        }

        this._isInitialized = false;
        this.logger.i('Thank you and goodbye');
    }

    /**
     * Order the {@link #subsystems} array to match the order they should be
     * initialized in.
     */
    private arrangeSubsystems(): void {
        this.subsystems.sort((a, b) => {
            if (b.wants.indexOf(a.id) !== -1) {
                return -1; /* initialize a before b */
            } else if (a.wants.indexOf(b.id) !== -1) {
                return 1; /* initialize b before a */
            } else {
                return 0; /* don't give a fuck */
            }
        });
    }

    private validateDependencies(chain: ISubsys[]): void {
        if (chain[0] === undefined) {
            return;
        }

        for (const id of chain[0].wants) {
            const dependency: ISubsys | undefined = this.subsysMap[id];
            if (typeof dependency === 'undefined') {
                throw new Error(
                    `Subsystem "${chain[0].id}" depends on unknown subsystem "${id}"`
                );
            }

            if (chain.indexOf(dependency) !== -1) {
                throw new Error(
                    `Circular dependency on subsystem "${id}" detected`
                );
            }

            this.validateDependencies([dependency, ...chain]);
        }
    }

}
