/**
 * `/user/auth` route interface definition.
 * @packageDocumentation
 *
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
import { IPrivateUserJSON } from '../../json/user';
import { IGetEndpoint, IPostEndpoint } from '../route';

/**
 * Request body for POST requests to the `/user/auth` endpoint.
 */
export interface IUserAuthPostRequestBody {
    userName?: string;
    passwd?: string;
}

/**
 * Response body for any request to the `/user/auth` endpoint.
 */
export interface IUserAuthResponseBody extends ISuccessResponseBody {
    token: string;
    user: IPrivateUserJSON;
}

/**
 * Interface definition for the `/user/auth` endpoint.
 */
export interface IUserAuthRoute extends
IGetEndpoint<undefined, IUserAuthResponseBody>,
IPostEndpoint<IUserAuthPostRequestBody, IUserAuthResponseBody> {}
