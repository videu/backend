/**
 * HTTP server subsystem implementation.
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

import { json as jsonBodyParser } from 'body-parser';
import Express, { Application as ExpressApp } from 'express';
import {
    createServer as createHTTPServer,
    Server as HTTPServer
} from 'http';

import {
    HTTP_SUBSYS_CONFIG_SCHEMA,
    IHTTPConfig,
    IHTTPSubsys
} from '../../types/core/http-subsys';
import { LifecycleState } from '../../types/core/lifecycle';
import { IRouteSubsys } from '../../types/core/route-subsys';
import { IRoute } from '../../types/routes/route';

import { defaultErrReqHandler } from '../error/default-error-handler';
import { IllegalStateError } from '../error/illegal-state-error';
import { InvalidConfigError } from '../error/invalid-config-error';
import { ipHeaderMiddleware } from '../middleware/ip-header';
import { toIntSafe } from '../util/conversions';
import { asyncChmod } from '../util/fs';
import { AbstractSubsysConfigurable } from './abstract-subsys';

/**
 * The HTTP server subsystem.
 */
export class HTTPSubsys
extends AbstractSubsysConfigurable<IHTTPConfig, [IRouteSubsys]>
implements IHTTPSubsys {

    /** The express instance. */
    public readonly express: ExpressApp;

    /**
     * A Map of all servers we are listening on where the hostname / socket is
     * the key.  TCP server keys have the form `hostname:port`.
     */
    private readonly servers: Map<string, HTTPServer> = new Map();

    constructor(config: IHTTPConfig | null = null) {
        super('http', config, HTTP_SUBSYS_CONFIG_SCHEMA);

        this.express = Express();
    }

    /**
     * @inheritdoc
     * @override
     */
    public async onInit(routeSubsys: IRouteSubsys): Promise<void> {
        await super.onInit(routeSubsys);

        this.express.use(ipHeaderMiddleware);
        this.express.use(jsonBodyParser({
            inflate: false,
            limit: '1kb',
            type: 'application/json',
        }));

        for (const route of routeSubsys.routes.values()) {
            this.use(route);
        }

        this.express.use(defaultErrReqHandler);

        if (this.config.port !== -1) {
            await this.listenTCP(this.config.host, this.config.port);
            this.logger.i(`Listening on tcp:${this.config.host}:${this.config.port}`);
        }
        if (this.config.socket !== '') {
            await this.listenUNIX(this.config.socket, this.config.socketMode);
            this.logger.i(`Listening on unix:${this.config.socket}`);
        }

        if (this.servers.size === 0) {
            throw new InvalidConfigError('Neither TCP nor UNIX socket specified');
        }
    }

    /**
     * @inheritdoc
     * @override
     */
    public async onExit(): Promise<void> {
        this.logger.v('Closing servers');

        for (const server of this.servers) {
            try {
                this.logger.d(`Closing server ${server[0]}`);
                await server[1].close();
                this.logger.d(`Server ${server[0]} closed`);
            } catch (err) {
                this.logger.e(`Could not close server ${server[0]}`, err);
            }
        }

        this.logger.v('Servers closed');
    }

    /* TODO: Find a way to implement these two with purely async functions */

    /** @inheritdoc */
    public listenTCP(host: string, port: number): Promise<HTTPServer> {
        return new Promise((resolve, reject) => {
            if (this.state !== LifecycleState.INITIALIZED) {
                reject(new IllegalStateError('HTTP subsystem not initialized yet'));
                return;
            }

            if (this.servers.has(`${host}:${port}`)) {
                reject(new Error(`Already listening on TCP port ${port}`));
                return;
            }

            const server = createHTTPServer(this.express);
            server.listen(port, host, () => {
                this.servers.set(`${host}:${port}`, server);
                resolve(server);
            }).on('error', err => reject(err));
        });
    }

    /** @inheritdoc */
    public listenUNIX(socketPath: string, permissions: number = 0o770): Promise<HTTPServer> {
        return new Promise(async (resolve, reject) => {
            if (this.state !== LifecycleState.INITIALIZED) {
                reject(new IllegalStateError('HTTP subsystem not initialized yet'));
                return;
            }

            if (this.servers.has(socketPath.toString())) {
                reject(new Error(`Already listening on ${socketPath.toString()}`));
                return;
            }

            const server = createHTTPServer(this.express);
            server.listen(socketPath, async () => {
                await asyncChmod(socketPath, permissions);
                this.servers.set(socketPath.toString(), server);
                resolve(server);
            }).on('error', httpErr => reject(httpErr));
        });
    }

    /** @inheritdoc */
    public set(setting: string, val: any) {
        if (this.state !== LifecycleState.INITIALIZED) {
            throw new IllegalStateError('HTTP subsystem is not initialized');
        }

        this.express.set(setting, val);
    }

    /**
     * Add a top-level route to express.
     * This is the same as calling the `use()` function on an express app, so
     * only top-level routes may be added here.
     *
     * @param route The route.
     */
    public use(route: IRoute) {
        if (this.state !== LifecycleState.INITIALIZED) {
            throw new IllegalStateError('HTTP subsystem is not initialized');
        }

        this.express.use(`/${route.name}`, route.router);
    }

    /**
     * @inheritdoc
     * @override
     */
    protected readConfigFromEnv(): IHTTPConfig {
        return {
            host: process.env.VIDEU_HTTP_HOST
                ? process.env.VIDEU_HTTP_HOST
                : undefined,

            port: process.env.VIDEU_HTTP_PORT
                ? toIntSafe(process.env.VIDEU_HTTP_PORT)
                : undefined,

            socket: process.env.VIDEU_HTTP_SOCKET
                ? process.env.VIDEU_HTTP_SOCKET
                : undefined,

            socketMode: process.env.VIDEU_HTTP_SOCKET_MODE
                ? Number.parseInt(process.env.VIDEU_HTTP_SOCKET_MODE, 8)
                : undefined,
        } as IHTTPConfig;
    }

}
