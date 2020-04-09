/**
 * @file `/info` route interface definition.
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

import { ISuccessResponseBody } from '../../json/response';
import { IGetEndpoint } from '../route';

/**
 * The response body for GET requests to the `/info` endpoint
 * (this is basically the same as `global.videu.version`).
 */
export interface IInfoGetResponseBody extends ISuccessResponseBody {
    clientIp: string;
    instance: string;
    time: number;
    version: {
        versionString: string;
        major: number;
        minor: number;
        patch: number;
        tags: string[];
    };
}

/**
 * Interface definition for the `/info` endpoint.
 */
export interface IInfoEndpoint extends IGetEndpoint<undefined, IInfoGetResponseBody> {}
