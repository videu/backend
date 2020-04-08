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

import { IUser } from '../../types/db/user';
import { FMWFactoryConfigurator } from '../../types/routes/middleware';

import { AuthError } from '../error/auth-error';
import { BackendError } from '../error/backend-error';

/**
 * Parse the JSON Web Token from the HTTP `Authorization` header.
 * If the token could not be parsed for whatever reason, an {@link AuthError}
 * is thrown.
 *
 * @param header The HTTP Authorization header.
 * @return The JWT.
 */
function getTokenFromHeader(header?: string): string {
    if (typeof header !== 'string') {
        throw new AuthError('Invalid authorization header');
    }

    /* Can be limited to the first 3 because anything above 2 is invalid anyway */
    const headerParts: string[] = header.split(' ', 3);
    if (headerParts[0] !== 'Bearer' || headerParts.length !== 2) {
        throw new AuthError('Invalid authorization header');
    }

    return headerParts[1];
}

/** Options for the `userLogin` middleware. */
interface IUserLoginMiddlewareOpts {
    soft: boolean;
}

/**
 * Middleware factory configurator for validating the `Authorization` header in
 * HTTP requests.
 *
 * @param config Configuration options.
 * @return The middleware factory.
 */
export const userLogin: FMWFactoryConfigurator<IUserLoginMiddlewareOpts> =
(config) => (logger, authSubsys, _storageSubsys) => async (req, res, next) => {
    let user: IUser;
    let token: string;

    try {
        token = getTokenFromHeader(req.headers.authorization);
        user = await authSubsys.verify(token);
    } catch (err) {
        if (err instanceof BackendError) {

            if (config.soft) {
                next();
            } else {
                res.set(
                    'WWW-Authenticate',
                    'Bearer realm="This endpoint requires authentication"'
                );
                next(err);
            }

        } else {

            logger.e(err);
            next(new BackendError(err.msg));

        }
        return;
    }

    req.videu.auth = {
        token: token,
        user: user,
    };
    next();
};
