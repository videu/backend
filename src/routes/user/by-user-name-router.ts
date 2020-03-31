/**
 * @file Route handlers for the `/user/byUserName` endpoint.
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
import { RouteLogger } from '../../util/logger';
import { userNameRegex } from '../../util/regex';

const log: ILogger = new RouteLogger('/user/byUserName');

export const byUserNameRouter: Router = Router();

/**
 * GET /user/byUserName/:id
 */
const byUserNameGetHandler: RequestHandler = async (req, res, next) => {
    if (typeof req.params.userName !== 'string') {
        res.status(400).json({
            msg: 'Invalid user name',
        });
        return;
    }

    const userName: string = req.params.userName;

    if (!userNameRegex.test(userName)) {
        res.status(400).json({
            msg: 'Invalid user name',
        });
        return;
    }

    try {
        const user: IUser | null = await userRepo.getByUserName(userName);

        if (user === null) {
            res.status(404).json({
                msg: 'Not found',
            });

            return;
        }

        res.status(200).json(user.toPublicJSON());
        return;
    } catch (err) {
        log.e(`GET: Error retrieving user id ${userName}`, err);
        res.status(500).json({
            msg: 'Internal server error',
        });

        return;
    }
};
byUserNameRouter.get('/:userName', byUserNameGetHandler);
