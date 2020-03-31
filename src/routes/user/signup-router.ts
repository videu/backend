/**
 * @file Route handlers for the `/user/signup` endpoint.
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
import { ObjectId } from 'mongodb';
import { generate as randomString } from 'randomstring';

import { IUser } from '../../../types/db/user';
import { ILogger } from '../../../types/logger';
import { userRepo } from '../../data/repository/user-repository';
import { ConflictError } from '../../error/conflict-error';
import { RouteLogger } from '../../util/logger';
import { passwdHash } from '../../util/passwd-hasher';
import { emailRegex, userNameRegex } from '../../util/regex';

const log: ILogger = new RouteLogger('/user/signup');

export const signupRouter: Router = Router();

/**
 * POST /user/signup
 */
export const signupPostHandler: RequestHandler = async (req, res, next) => {
    if (typeof req.body !== 'object' || req.body === null) {
        res.status(400).json({
            msg: 'Invalid user data',
        });
        return;
    }

    if (typeof req.body.email !== 'string' || !emailRegex.test(req.body.email)) {
        res.status(400).json({
            msg: 'Invalid email address',
        });
        return;
    }

    if (typeof req.body.userName !== 'string' || !userNameRegex.test(req.body.userName)) {
        res.status(400).json({
            msg: 'Invalid user name',
        });
        return;
    }

    if (typeof req.body.passwd !== 'string' || req.body.passwd.length < 8) {
        res.status(400).json({
            msg: 'Invalid password',
        });
        return;
    }

    if (typeof req.body.settings !== 'object' || req.body.settings === null) {
        req.body.settings = {
            newsletter: false,
            showPP: false,
        };
    } else {
        if (typeof req.body.settings.newsletter !== 'boolean') {
            req.body.settings.newsletter = false;
        }
        if (typeof req.body.settings.showPP !== 'boolean') {
            req.body.settings.showPP = false;
        }
    }

    let hashedPasswd: string;
    try {
        hashedPasswd = await passwdHash(req.body.passwd);
    } catch (err) {
        if (err instanceof RangeError) {
            res.status(400).json({
                msg: err.message,
            });
            return;
        } else {
            next(err);
            return;
        }
    }

    const id: ObjectId = new ObjectId();
    let user: IUser;
    try {
        user = await userRepo.register({
            _id: id,
            activationToken: randomString(64),
            email: req.body.email,
            passwd: hashedPasswd,
            settings: req.body.settings,
            uName: req.body.userName,
        });
    } catch (err) {
        if (err instanceof ConflictError) {
            // user or email already exists
            res.status(409).json({
                msg: err.message,
            });
        } else {
            // we fucked something up
            next(err);
        }
        return;
    }

    res.status(201).json({
        msg: 'success',
        user: user.toPrivateJSON(),
    });
};
signupRouter.post('/', signupPostHandler);
