/**
 * @file Stub auth subsystem implementation.
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

import Express from 'express';
import { Server } from 'http';

import { IHTTPConfig, IHTTPSubsys } from '../../../types/core/http-subsys';
import { LifecycleState } from '../../../types/core/lifecycle';
import { IRoute } from '../../../types/routes/route';

import { IllegalStateError } from '../../../src/error/illegal-state-error';

/**
 * Stub implementation of the auth subsystem.
 */
export class StubHTTPSubsys implements IHTTPSubsys {

    public id: string = 'http';

    public state: LifecycleState = LifecycleState.INITIALIZED;

    public express = Express();

    public config: IHTTPConfig = {
        host: '127.0.0.1',
        port: 4201,
        socket: '',
        socketMode: 0o770,
    };

    public async listenTCP(host: string, port: number) {
        return null as any as Server;
    }

    public async listenUNIX(socket: string, mode: number) {
        return null as any as Server;
    }

    public set(name: string, val: any) {
        this.express.set(name, val);
    }

    public use(route: IRoute) {
        return;
    }

    public async init() {
        if (this.state !== LifecycleState.CREATED) {
            throw new IllegalStateError('Not in CREATED state');
        }

        this.state = LifecycleState.INITIALIZED;
    }

    public async exit() {
        this.state = LifecycleState.EXITED;
    }

}
