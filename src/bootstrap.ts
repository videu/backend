/**
 * @file The main application loader.
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

import '../types/global';
import { banner } from './util/banner';

// begin preparation section

const timeOnStart = Date.now();

process.env._VIDEU_LOADED = 'true';

/*
 * Ensure that index.js has been executed before doing anything else.
 * This might not be the case if the server is started with npm run-script dev.
 */
if (typeof global.videu === 'undefined') {
    /* tslint:disable-next-line:no-var-requires */
    require('../index.js');
}

import fs from 'fs';
import http, { Server } from 'http';

import { ILogger } from '../types/logger';
import { Logger, parseLogLevel } from './util/logger';

const log: ILogger = new Logger('Core');

let pendingTasks: number = 0;
let server: Server;

/**
 * Callback for asynchronous startup tasks when they have finished.
 */
function taskFinishedCallback() {
    if (--pendingTasks <= 0) {
        log.i(`Initialization successful in ${Date.now() - timeOnStart} ms.`);
    }
}

global.videu.logLevel =
    parseLogLevel(process.env.VIDEU_LOG_LEVEL || 'info') || Logger.LEVEL_INFO;

if (Logger.shouldLog(Logger.LEVEL_DEBUG)) {
    /* tslint:disable-next-line:no-console */
    console.info('\nConfiguration:\n%o\n', global.videu);
}

import { jwtBootstrap } from './bootstrap/jwt';
import { mongoBootstrap } from './bootstrap/mongo';

import { app } from './app';

if (banner !== null) {
    log.i(banner);
}

Promise.all([jwtBootstrap(), mongoBootstrap()]);

// end preparation section

// begin main application

if (typeof global.videu.socket === 'string') {
    pendingTasks++;

    fs.stat(global.videu.socket, fsErr => {
        if (!fsErr) {
            // global.videu.socket can only be of type string here, but
            // TypeScript has a different opinion about that because we
            // are async.
            fs.unlinkSync(global.videu.socket || '');
        }

        const unixServer = http.createServer(app);
        unixServer.listen(global.videu.socket, function() {
            fs.chmodSync(
                global.videu.socket || '',
                process.env.videu_SOCKET_MODE || '755'
            );

            log.i(`Listening on UNIX socket ${global.videu.socket}`);
            taskFinishedCallback();
        }).on('error', httpErr => {
            log.s(
                `failed to bind to UNIX socket ${global.videu.socket}`,
                httpErr
            );
            process.exit(1);
        });
    });
}

if (typeof global.videu.port === 'number') {
    pendingTasks++;

    server = http.createServer(app);
    server.listen(global.videu.port, function() {
        log.i(`Listening on TCP port ${global.videu.port}`);
        taskFinishedCallback();
    }).on('error', err => {
        log.s(`Failed to bind to TCP port ${global.videu.port}`, err);
        process.exit(1);
    });
}

if (global.videu.socket === null && global.videu.port === null) {
    log.s('Neither port not socket have been specified');
    process.exit(1);
}

function shutdown() {
    log.i('closing connections');

    server.close(() => {
        log.i('Thank you and goodbye');
        process.exit(0);
    });

    setTimeout(() => {
        log.e('Timeout while trying to stop the server, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

process.on('SIGINT', shutdown);
