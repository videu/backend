/**
 * @file Populate the `global.videu` field with defaults for unit testing.
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

global.videu = {
    appName: 'videu test',
    logLevel: 0x3f,
    instanceId: 'unit-test',
    jwtSecret: require('./jwt-key'),
    port: 4201,
    socket: null,
    mongo: {
        host: '127.0.0.1',
        port: 27017,
        db: 'videu_test',
        user: 'test',
        passwd: 'password',
        authSource: 'admin',
        ssl: false,
    },
    smtp: {
        enable: false,
        host: '127.0.0.1',
        port: 587,
        secutiry: 'STARTTLS',
        user: 'test@example.com',
        passwd: 'password',
        authMethod: 'plain',
        replyTo: 'no-reply@example.com',
        fromName: 'videu unit test <test@example.com>',
    },
    version: {
        versionString: '0.1.0-alpha',
        major: 0,
        minor: 1,
        patch: 0,
        tags: [
            'alpha',
        ],
    },
};
