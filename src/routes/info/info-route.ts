/**
 * @file `/info` route implementation.
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

import { IAuthSubsys } from '../../../types/core/auth-subsys';
import { IStorageSubsys } from '../../../types/core/storage-subsys';
import { IInfoEndpoint, IInfoGetResponseBody } from '../../../types/routes/info/info-endpoint';
import { IRequest, IResponse } from '../../../types/routes/route';

import { AbstractRoute } from '../abstract-route';

/**
 * `/info` route implementation.
 */
export class InfoRoute extends AbstractRoute implements IInfoEndpoint {

    constructor(authSubsys: IAuthSubsys, storageSubsys: IStorageSubsys) {
        super('info', authSubsys, storageSubsys);
    }

    /**
     * GET `/info`: Obtain general information about the backend server.
     *
     * Request body: none
     *
     * Response body:
     *
     * ```json
     * {
     *     "err": false,
     *     "clientIp": "<client IP address>",
     *     "instance": "<instance id of this server>",
     *     "time": 1234567890, // The server's UNIX time in millisecondss
     *     "version": {
     *         "versionString": "1.2.3-tag",
     *         "major": 1,
     *         "minor": 2,
     *         "patch": 3,
     *         "tags": [ "tag" ]
     *     }
     * }
     * ```
     */
    public async get(req: IRequest, res: IResponse<IInfoGetResponseBody>) {
        res.set('access-control-allow-origin', '*');
        res.status(200).json({
            err: false,
            clientIp: req.videu.clientIp,
            instance: global.videu.instanceId,
            time: Date.now(),
            version: global.videu.version,
        });
    }

}
