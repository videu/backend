/**
 * @file Middleware for checking whether a user is logged in.
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

import { RequestHandler } from 'express';

import { IUser } from '../../types/db/user';
import { ILogger } from '../../types/logger';
import { AuthError } from '../error/auth-error';
import { HttpError } from '../error/http-error';
import { jwtVerify } from '../util/jwt';
import { Logger } from '../util/logger';

const log: ILogger = new Logger('UserLoginMiddleware');

/**
 * Validate the `Authorization` HTTP header and, if it was valid, return the
 * user it was issued to.
 *
 * @param header The value of the `Authorization` HTTP header.
 * @returns The validated user.
 * @throws Either an `AuthError` if the authentication header was invalid, or
 * another error if we had an internal problem.
 */
async function validateAuthHeader(header: any): Promise<IUser> {
    if (typeof header !== 'string') {
        throw new AuthError('Invalid authorization header');
    }

    /* Can be limited to the first 3 because anything above 2 is invalid anyway */
    const headerParts: string[] = header.split(' ', 3);
    if (headerParts[0] !== 'Bearer' || headerParts.length !== 2) {
        throw new AuthError('Invalid authorization header');
    }

    return await jwtVerify(headerParts[1]);
}

/**
 * Middleware for validating the `Authorization` HTTP header.
 *
 * If the JSON web token is valid, the user is stored in the request's
 * `videu.user` property.  If not, the request is rejected immediately with an
 * HTTP 401 code.
 */
export const userLoginMiddleware: RequestHandler = async (req, res, next) => {
    let user: IUser;

    try {
        user = await validateAuthHeader(req.headers.authorization);
    } catch (err) {
        if (err instanceof AuthError) {
            res.set('WWW-Authenticate', 'Bearer realm="This endpoint requires authentication"');
            res.status(401).json({
                msg: 'Invalid session',
            });
        } else {
            log.e(err);
            next(new HttpError(err.msg, 500));
        }
        return;
    }

    req.videu.user = user;
    next();
};

/**
 * Like `{@link userLoginMiddleware}`, but does not reject the request if the
 * authentication check failed (the `videu.user` property in the `req` object
 * just stays `undefined` in that case).
 */
export const softUserLoginMiddleware: RequestHandler = async (req, res, next) => {
    let user: IUser;

    try {
        user = await validateAuthHeader(req.headers.authorization);
    } catch (err) {
        if (!(err instanceof AuthError)) {
            log.e(err);
            next(new HttpError(err.msg, 500));
        }
        return;
    }

    req.videu.user = user;
    next();
};
