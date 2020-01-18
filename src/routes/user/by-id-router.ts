/**
 * @file Route handlers for the `/user/byId` endpoint.
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

import { ObjectId } from 'bson';
import { RequestHandler, Router } from 'express';

import { userRepo } from '../../data/repository/user-repository';
import { HttpError } from '../../error/http-error';
import { IUser } from '../../types/db/user';
import { ILogger } from '../../types/logger';
import { RouteLogger } from '../../util/logger';
import { objectIdRegex } from '../../util/regex';

const log: ILogger = new RouteLogger('/user/byId');

export const byIdRouter: Router = Router();

/**
 * GET `/user/byId/:id`
 */
export const byIdGetHandler: RequestHandler = async (req, res, next) => {
    if (typeof req.params.id !== 'string' || !objectIdRegex.test(req.params.id)) {
        res.status(400).json({
            msg: 'Invalid user id',
        });
        return;
    }

    const id: ObjectId = new ObjectId(req.params.id);

    try {
        const user: IUser | null = await userRepo.getById(id);

        if (user === null) {
            res.status(404).json({
                msg: 'Not found',
            });
            return;
        }

        res.status(200).json(user.toClientJSON());
        return;
    } catch (err) {
        log.e(`GET: Database error while retrieving id ${id}`, err);
        next(new HttpError(err.message, 500));
        return;
    }
};
byIdRouter.get('/:id', byIdGetHandler);
