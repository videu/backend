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

import { IAuthSubsys } from '../../types/core/auth-subsys';
import { IHTTPSubsys } from '../../types/core/http-subsys';
import { LifecycleState } from '../../types/core/lifecycle';
import { IMongoSubsys } from '../../types/core/mongo-subsys';
import { IStorageSubsys } from '../../types/core/storage-subsys';
import { IVideu } from '../../types/core/videu';
import { ILogger } from '../../types/logger';

import { IllegalStateError } from '../error/illegal-state-error';
import { Logger } from '../util/logger';
import { AuthSubsys } from './auth-subsys';
import { HTTPSubsys } from './http-subsys';
import { MongoSubsys } from './mongo-subsys';
import { StorageSubsys } from './storage-subsys';

/**
 * The main application class controlling all subsystems.
 */
export class Videu implements IVideu {

    /** The application name. */
    public readonly appName: string = process.env.VIDEU_APP_NAME || 'videu';

    private authSubsys: IAuthSubsys;

    /** The subsystem for managing express. */
    private httpSubsys: IHTTPSubsys;

    /** The subsystem managing the MongoDB connection. */
    private mongoSubsys: IMongoSubsys;

    /** The subsystem for repository management. */
    private storageSubsys: IStorageSubsys;

    /** The logger for this class. */
    private logger: ILogger = new Logger('core');

    /**
     * Internal storage for keeping the public {@link isInitialized} getter
     * readonly while being able to change its value internally.
     */
    private _state: LifecycleState = LifecycleState.CREATED;

    /**
     * Create a new application instance.
     * There should be at most one instance of this class per server.
     */
    constructor() {
        this.authSubsys = new AuthSubsys();
        this.httpSubsys = new HTTPSubsys();
        this.mongoSubsys = new MongoSubsys();
        this.storageSubsys = new StorageSubsys();
    }

    /** @inheritdoc */
    public get state(): LifecycleState {
        return this._state;
    }

    /** @inheritdoc */
    public async init() {
        let currentId: string = '';
        try {
            currentId = this.httpSubsys.id;
            await this.httpSubsys.init();

            currentId = this.mongoSubsys.id;
            await this.mongoSubsys.init();

            currentId = this.storageSubsys.id;
            await this.storageSubsys.init(this.mongoSubsys);

            currentId = this.authSubsys.id;
            await this.authSubsys.init(this.storageSubsys);
        } catch (err) {
            this.logger.e(`Error while initializing the ${currentId} subsystem`, err);
            this._state = LifecycleState.ERROR;
            throw err;
        }

        this._state = LifecycleState.INITIALIZED;
    }

    /** @inheritdoc */
    public async exit() {
        if (this.state !== LifecycleState.INITIALIZED && this.state !== LifecycleState.ERROR) {
            throw new IllegalStateError('Cannot exit before init');
        }

        /* TODO: Find a more elegant approach for this mess */

        try {
            if (this.authSubsys.state === LifecycleState.INITIALIZED) {
                await this.authSubsys.exit();
            }
        } catch (err) {
            this.logger.e('Unable to de-initialize the auth subsystem', err);
        }

        try {
            if (this.storageSubsys.state === LifecycleState.INITIALIZED) {
                await this.storageSubsys.exit();
            }
        } catch (err) {
            this.logger.e('Unable to de-initialize the storage subsystem', err);
        }

        try {
            if (this.httpSubsys.state === LifecycleState.INITIALIZED) {
                await this.httpSubsys.exit();
            }
        } catch (err) {
            this.logger.e('Unable to de-initialize the http subsystem', err);
        }

        try {
            if (this.mongoSubsys.state === LifecycleState.INITIALIZED) {
                await this.mongoSubsys.exit();
            }
        } catch (err) {
            this.logger.e('Unable to de-initialize the mongo subsystem', err);
        }

        this._state = LifecycleState.EXITED;
        this.logger.i('Thank you and goodbye');
    }

}
