/**
 * @file HTTP server subsystem implementation.
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
import { chmod, PathLike, stat } from 'fs';
import {
    createServer as createHTTPServer,
    Server as HTTPServer
} from 'http';

import {
    HTTP_SUBSYS_CONFIG_SCHEMA,
    IHTTPConfig,
    IHTTPSubsys
} from '../../types/core/http-subsys';

import { infoRouter } from '../routes/info-router';
import { userRouter } from '../routes/user-router';
import { videoRouter } from '../routes/video-router';

import { defaultErrReqHandler } from '../error/default-error-handler';
import { IllegalStateError } from '../error/illegal-state-error';
import { InvalidConfigError } from '../error/invalid-config-error';
import { ipHeaderMiddleware } from '../middleware/ip-header';
import { toIntSafe } from '../util/conversions';
import { AbstractSubsysConfigurable } from './abstract-subsys';

/**
 * The HTTP server subsystem.
 */
export class HTTPSubsys
extends AbstractSubsysConfigurable<IHTTPConfig>
implements IHTTPSubsys {

    /** The express instance. */
    private readonly express: ExpressApp;

    /**
     * A Map of all servers we are listening on where the hostname / socket is the key.
     * TCP server keys have the form `hostname:port`.
     */
    private readonly servers: Map<string, HTTPServer> = new Map();

    constructor(config: IHTTPConfig | null = null) {
        super('express', config, HTTP_SUBSYS_CONFIG_SCHEMA);

        this.express = Express();
    }

    /**
     * @inheritdoc
     * @override
     */
    public async init(): Promise<void> {
        await super.init();

        this.express.use(ipHeaderMiddleware);
        this.express.use(jsonBodyParser({
            inflate: false,
            limit: '1kb',
            type: 'application/json',
        }));

        /* TODO: Replace these with some OOP magic */
        this.express.use('/info', infoRouter);
        this.express.use('/user', userRouter);
        this.express.use('/video', videoRouter);

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
    public async exit(): Promise<void> {
        await super.exit();

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

    /**
     * @inheritdoc
     * @override
     */
    public listenTCP(host: string, port: number): Promise<HTTPServer> {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
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

    /**
     * @inheritdoc
     * @override
     */
    public listenUNIX(socket: PathLike, permissions: number = 0o770): Promise<HTTPServer> {
        return new Promise(async (resolve, reject) => {
            if (!this.isInitialized) {
                reject(new IllegalStateError('HTTP subsystem not initialized yet'));
                return;
            }

            if (this.servers.has(socket.toString())) {
                reject(new Error(`Already listening on ${socket.toString()}`));
                return;
            }

            let shouldContinue: boolean = true;
            await stat(this.config.socket, fsErr => {
                if (fsErr !== null) {
                    reject(fsErr);
                    shouldContinue = false;
                }
            });
            if (!shouldContinue) {
                return;
            }

            const server = createHTTPServer(this.express);
            server.listen(socket, () => {
                chmod(socket, permissions, () => {
                    this.logger.i(`Listening on UNIX socket ${socket}`);
                    this.servers.set(socket.toString(), server);
                    resolve(server);
                });
            }).on('error', httpErr => reject(httpErr));
        });
    }

    /**
     * @inheritdoc
     * @override
     */
    public set(setting: string, val: any) {
        if (!this.isInitialized) {
            throw new IllegalStateError('HTTP subsystem is not initialized yet');
        }

        this.express.set(setting, val);
    }

    /* TODO: Add `use(route)` method for adding routes when the route subsys is implemented */

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
