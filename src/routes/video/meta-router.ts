/**
 * @file Route handlers for the `/video/meta` endpoint.
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

import { IVideo } from '../../../types/db/video';
import { ILogger } from '../../../types/logger';
import { videoRepo } from '../../data/repository/video-repository';
import { RouteLogger } from '../../util/logger';
import { objectIdRegex } from '../../util/regex';

const log: ILogger = new RouteLogger('/video/meta');

export const metaRouter: Router = Router();

/**
 * GET `/video/meta/:id`
 */
export const metaGetHandler: RequestHandler = async (req, res, next) => {
    if (typeof req.params.id !== 'string' || !objectIdRegex.test(req.params.id)) {
        res.status(400).json({
            msg: 'Invalid video id',
        });

        return;
    }

    const id: ObjectId = new ObjectId(req.params.id);
    try {
        const video: IVideo | null = await videoRepo.getById(id);

        if (video === null) {
            res.status(404).json({
                msg: 'Not found',
            });

            return;
        }

        res.status(200).json(video.toPublicJSON());
        return;
    } catch (err) {
        log.e(`GET: Database error while retrieving id ${id}`, err);
        res.status(500).json({
            msg: 'Internal server error',
        });

        return;
    }
};
metaRouter.get('/:id', metaGetHandler);
