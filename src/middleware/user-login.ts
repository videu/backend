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
import { verify as jwtVerify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { userRepo } from '../data/repository/user-repository';
import { HttpError } from '../error/http-error';
import { IUser } from '../types/db/user';
import { objectIdRegex } from '../util/regex';

/**
 * Validate the `Authorization` HTTP header and, if it was valid, fetch the user
 * data corresponding to the user id that is encoded in the JWT from the
 * repository.
 *
 * @param header The value of the `Authorization` HTTP header.
 * @returns The validated user, or `null` if either the authorization header
 * itself or the JWT it carries is invalid.
 * @throws Any error that can occur while obtaining data from the user
 * repository.
 */
function validateAuthHeader(header: any): Promise<IUser | null> {
    return new Promise(async (resolve, reject) => {
        if (typeof header !== 'string') {
            resolve(null);
            return;
        }

        const headerParts: string[] = header.split(' ', 3);
        if (headerParts[0] !== 'Bearer' || headerParts.length !== 2) {
            resolve(null);
            return;
        }

        if (!objectIdRegex.test(headerParts[1])) {
            resolve(null);
            return;
        }

        let userIdStr: string;
        try {
            const tmp: string | object = jwtVerify(headerParts[1], global.videu.jwtSecret);
            if (typeof tmp !== 'string') {
                resolve(null);
                return;
            }
            userIdStr = tmp;
        } catch (err) {
            return null;
        }

        if (!objectIdRegex.test(userIdStr)) {
            return null;
        }

        const userId: ObjectId = new ObjectId(headerParts[1]);
        const user: IUser | null = await userRepo.getById(new ObjectId(headerParts[1]));

        return user;
    });
}

/**
 * Middleware for validating the `Authorization` HTTP header.
 *
 * If the JSON web token is valid, the user is stored in the request's
 * `videu.user` property.  If not, the request is rejected immediately with an
 * HTTP 401 code.
 */
export const userLoginMiddleware: RequestHandler = async (req, res, next) => {
    let user: IUser | null;
    try {
        user = await validateAuthHeader(req.headers.authorization);
    } catch (err) {
        next(new HttpError(err.msg, 500));
        return;
    }

    if (user === null) {
        res.set('WWW-Authenticate', 'Bearer realm="This endpoint requires authentication"');
        res.status(401).json({
            msg: 'Invalid session',
        });
        return;
    }

    req.videu.user = user;
    next();
};

/**
 * Like {@link userLoginMiddleware}, but does not reject the request if the
 * authentication check failed (the `videu.user` property in the `req` object
 * just stays `undefined` in that case).
 */
export const softUserLoginMiddleware: RequestHandler = async (req, res, next) => {
    let user: IUser | null;
    try {
        user = await validateAuthHeader(req.headers.authorization);
    } catch (err) {
        next(new HttpError(err.msg, 500));
        return;
    }

    if (user !== null) {
        req.videu.user = user;
    }

    next();
};
