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

import { IHTTPSubsys } from '../../types/core/http-subsys';
import { IMongoSubsys } from '../../types/core/mongo-subsys';
import { IVideu } from '../../types/core/videu';
import { ILogger } from '../../types/logger';

import { Logger } from '../util/logger';
import { HTTPSubsys } from './http-subsys';
import { MongoSubsys } from './mongo-subsys';

/**
 * The main application class controlling all subsystems.
 */
export class Videu implements IVideu {

    /** The application name. */
    public readonly appName: string = process.env.VIDEU_APP_NAME || 'videu';

    /** The subsystem for managing express. */
    private httpSubsys: IHTTPSubsys;

    /** The subsystem managing the MongoDB connection. */
    private mongoSubsys: IMongoSubsys;

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
     */
    constructor() {
        this.httpSubsys = new HTTPSubsys();
        this.mongoSubsys = new MongoSubsys();
    }

    /** @inheritdoc */
    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    /** @inheritdoc */
    public async init() {
        try {
            await this.httpSubsys.init();
        } catch (err) {
            this.logger.e('Unable to initialize the http subsystem', err);
            await this.exit();
            return;
        }
        try {
            await this.mongoSubsys.init();
        } catch (err) {
            this.logger.e('Unable to initialize the mongo subsystem', err);
            await this.exit();
            return;
        }

        this._isInitialized = true;
    }

    /** @inheritdoc */
    public async exit() {
        try {
            if (this.httpSubsys.isInitialized) {
                await this.httpSubsys.exit();
            }
        } catch (err) {
            this.logger.e('Unable to de-initialize the http subsystem', err);
        }
        try {
            if (this.mongoSubsys.isInitialized) {
                await this.mongoSubsys.exit();
            }
        } catch (err) {
            this.logger.e('Unable to de-initialize the mongo subsystem', err);
        }

        this._isInitialized = false;
        this.logger.i('Thank you and goodbye');
    }

}
