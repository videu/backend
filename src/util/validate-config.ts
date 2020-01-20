/**
 * @file Validate the `global.videu` configuration object.
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

import { ILogger } from '../../types/logger';
import { Logger } from './logger';

export function validateJwTConfig(): boolean {
    const log: ILogger = new Logger('JWT');
    let valid: boolean = true;

    if (typeof global.videu.jwtSecret !== 'string') {
        log.s('No certificate path specified');
        valid = false;
    }

    return valid;
}

/**
 * Check the `global.videu.mongo` configuration object for semantic validity.
 *
 * @returns `true` if everything is ok, `false` otherwise.
 */
export function validateMongoConfig(): boolean {
    const log: ILogger = new Logger('Mongo');
    let valid: boolean = true;

    if (
        typeof global.videu.mongo.host !== 'string' ||
        global.videu.mongo.host === ''
    ) {
        log.s('No host name specified');
        valid = false;
    }

    if (typeof global.videu.mongo.port !== 'number') {
        log.s('No port number specified');
        valid = false;
    }

    if (
        typeof global.videu.mongo.db !== 'string' ||
        global.videu.mongo.db === ''
    ) {
        log.s('No database name specified');
        valid = false;
    }

    if (
        typeof global.videu.mongo.user !== 'string' ||
        global.videu.mongo.user === ''
    ) {
        log.w('No user name specified, disabling authentication');
    }
    if (
        typeof global.videu.mongo.passwd !== 'string' ||
        global.videu.mongo.passwd === ''
    ) {
        log.w('No password specified, disabling authentication');
    }

    if (
        typeof global.videu.mongo.authSource !== 'string' &&
        (
            typeof global.videu.mongo.user !== 'string' ||
            typeof global.videu.mongo.passwd !== 'string'
        )
    ) {
        log.s('Login enabled, but no authentication source specified');
        valid = false;
    }

    if (global.videu.mongo.ssl !== true) {
        if (process.env.NODE_ENV === 'production') {
            log.s(
                'Refusing to start without SSL and NODE_ENV === \'production\''
            );
            valid = false;
        }

        log.w('SSL is disabled');
    }

    return valid;
}

/**
 * Check the `global.videu.smtp` configuration object for semantic validity.
 *
 * @returns `true` if everything is ok, `false` otherwise.
 */
export function validateSMTPConfig(): boolean {
    const log: ILogger = new Logger('SMTP');
    let valid: boolean = true;

    if (global.videu.smtp.enable !== true) {
        if (process.env.NODE_ENV === 'production') {
            log.s(
                'Refusing to start without SMTP and NODE_ENV === \'production\''
            );
            valid = false;
        } else {
            log.w('SMTP is disabled');
            return true;
        }
    }

    if (typeof global.videu.smtp.host !== 'string') {
        log.s('No SMTP host name specified');
        valid = false;
    }

    if (typeof global.videu.smtp.port !== 'number') {
        log.s('No SMTP port specified');
        valid = false;
    }

    if (global.videu.smtp.authMethod === 'none') {
        log.w('Authentication is disabled');
    } else {
        if (typeof global.videu.smtp.user !== 'string') {
            log.s('Authentication enabled, but no user name specified');
            valid = false;
        }

        if (typeof global.videu.smtp.passwd !== 'string') {
            log.s('Authentication enabled, but no password specified');
            valid = false;
        }
    }

    return valid;
}
