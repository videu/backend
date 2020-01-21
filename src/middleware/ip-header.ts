/**
 * @file Middleware for setting the IP header
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

import '../../types/express';

const realIpHeader: string = process.env.VIDEU_REAL_IP_HEADER || '';
export let ipHeaderMiddleware: RequestHandler;

if (typeof realIpHeader === 'string' && realIpHeader.length > 0) {
    ipHeaderMiddleware = (req, res, next) => {
        const ip = req.headers[realIpHeader];

        if (typeof ip === 'string') {
            req.videu = {
                clientIp: ip,
            };
        } else if (Array.isArray(ip)) {
            req.videu = {
                clientIp: ip[0],
            };
        } else {
            req.videu = {
                clientIp: '0.0.0.0',
            };
        }

        next();
    };
} else {
    ipHeaderMiddleware = (req, res, next) => {
        req.videu = {
            clientIp: req.ip,
        };

        next();
    };
}
