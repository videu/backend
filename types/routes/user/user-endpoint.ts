/**
 * @file `/user` route interface definition.
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
import { IUserJSON } from '../../json/user';
import { IGetEndpoint } from '../route';

/**
 * Request body for GET requests to the `/user` endpoint.
 */
export interface IUserGetRequestBody {
    id?: string;
    userName?: string;
}

/**
 * Response body for GET requests to the `/user` endpoint.
 */
export interface IUserGetResponseBody extends ISuccessResponseBody {
    user: IUserJSON;
}

/**
 * Request body for PUT requests to the `/user` endpoint.
 */
export interface IUserPutRequestBody {
    userName?: string;
    passwd?: string;
    displayName?: string;
    settings?: {
        newsletter?: boolean;
        showPP?: boolean;
    };
}

/**
 * Interface definition for the `/user` endpoint.
 */
export interface IUserEndpoint extends
IGetEndpoint<IUserGetRequestBody, IUserGetResponseBody> {}
