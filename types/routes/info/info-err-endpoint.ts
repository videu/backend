/**
 * `/info/err` route interface definition.
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
import { IGetEndpoint } from '../route';

/**
 * The response body for GET requests to the `/info/err` endpoint.
 */
export interface IInfoErrGetResponseBody extends ISuccessResponseBody {
    /** A map of all localized error messages. */
    messages: {
        [messageId: string]: string
    };
}

/**
 * Interface definition for the `/info/err` endpoint.
 */
export interface IInfoErrEndpoint extends IGetEndpoint<undefined, IInfoErrGetResponseBody> { }
