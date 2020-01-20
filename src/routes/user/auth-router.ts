/**
 * @file Route handlers for the `/user/auth` endpoint.
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

import { RequestHandler, Router } from 'express';

import { IUser } from '../../../types/db/user';
import { ILogger } from '../../../types/logger';
import { userRepo } from '../../data/repository/user-repository';
import { HttpError } from '../../error/http-error';
import { jwtSign, jwtVerify } from '../../util/jwt';
import { RouteLogger } from '../../util/logger';
import { passwdVerify } from '../../util/passwd-hasher';
import { userNameRegex } from '../../util/regex';

const log: ILogger = new RouteLogger('/user/auth');

export const authRouter: Router = Router();

/**
 * GET `/user/auth`
 *
 * Validate the JSON web token supplied in the `Authorization` HTTP header.
 */
export const authGetHandler: RequestHandler = async (req, res, next) => {
    function _reject(msg: string) {
        res.status(200).json({
            err: 401,
            msg: msg,
        });
    }

    if (typeof req.headers.authorization !== 'string') {
        _reject('No authorization header present');
        return;
    }

    const authHeader: string[] = req.headers.authorization.split(' ');
    if (authHeader.length !== 2 || authHeader[0] !== 'Bearer') {
        _reject('Invalid authorization header');
        return;
    }

    let user: IUser | null;

    try {
        user = await jwtVerify(authHeader[1]);
        if (user === null) {
            _reject('Expired token');
            return;
        }
    } catch (err) {
        _reject('Invalid token');
        next(err);
        return;
    }

    res.status(200).json({
        msg: 'success',
        user: user.toClientJSON(true),
    });
};
authRouter.get('/', authGetHandler);

/**
 * POST `/user/auth`
 *
 * Perform an authentication request.
 *
 * Body:
 * ```json
 * {
 *     "userName": "userNameWithout@",
 *     "passwd": "p4ssw0rd"
 * }
 * ```
 */
export const authPostHandler: RequestHandler = async (req, res, next) => {
    function _reject() {
        res.status(200).json({
            err: 401,
            msg: 'Invalid username or password',
        });
    }

    if (
        typeof req.body !== 'object' ||
        typeof req.body.userName !== 'string' ||
        typeof req.body.passwd !== 'string'
    ) {
        res.status(400).json({
            msg: 'No credentials specified',
        });
        return;
    }

    const userName: string = req.body.userName;
    const passwd: string = req.body.passwd;

    if (!userNameRegex.test(userName) || passwd.length < 8) {
        _reject();
        return;
    }

    const user: IUser | null = await userRepo.getByUserName(userName);
    if (user === null) {
        _reject();
        return;
    }

    try {
        // I realize the ` === true` part is boilerplate, but this is one of
        // the few endpoints that CAN NOT get fucked up so we play it safe.
        if (await passwdVerify(passwd, user.passwd) === true) {
            const token: string = await jwtSign(user);
            res.status(200).json({
                msg: 'success',
                token: token,
                user: user.toClientJSON(true),
            });
            return;
        } else {
            _reject();
            return;
        }
    } catch (err) {
        next(new HttpError(err.message || 'Internal server error', 500));
        return;
    }
};
authRouter.post('/', authPostHandler);
