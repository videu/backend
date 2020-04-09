/**
 * The BackendError class.
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

import { HTTPStatusCode, IErrorResponseBody } from '../../types/json/response';

/**
 * General error condition that is sthe fault of the client.
 * If an error of this class is caught in a route handler, the output of
 * {@linkcode .toJSON} is sent to the client.
 */
export class BackendError extends Error {

    /** The HTTP status code to respond with. */
    public readonly statusCode: HTTPStatusCode;

    /**
     * Create a new backend error.
     *
     * @param msg The error message.
     * @param statusCode The HTTP status code to respond with.
     */
    public constructor(msg: string, statusCode: number = HTTPStatusCode.INTERNAL_SERVER_ERROR) {
        super(msg);

        this.statusCode = statusCode;
    }

    /**
     * Return a JSON object that can be sent to the client as an error response.
     */
    public toJSON(): IErrorResponseBody {
        return {
            err: true,
            msg: this.message,
        };
    }

}
