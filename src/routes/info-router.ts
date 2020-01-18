/**
 * @file Route handlers for all endpoints in `/info`.
 * @author Felix Kopp <sandtler@sandtler.club>
 *
 * The `/info` route is just for general information on the backend server.
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

export const infoRouter: Router = Router();

/**
 * GET `/info`
 */
export const infoGetHandler: RequestHandler = (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).json({
        clientIp: req.videu.clientIp,
        instance: global.videu.instanceId,
        time: Date.now(),
        version: global.videu.version,
    });
};
infoRouter.get('/', infoGetHandler);
