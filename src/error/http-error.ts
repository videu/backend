/**
 * @file Generic class for HTTP error codes.
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

import { HTTPStatusCode } from '../../types/json/response';

/**
 * Represents an HTTP error message that gets caught by the master error handler
 * in `./default-error-handler`, where it is sent to the client.
 */
export class HttpError extends Error {

    /** The HTTP status code to reply with. */
    public readonly status: HTTPStatusCode;

    /**
     * Create a new HTTP error.
     *
     * @param msg The error message.
     * @param status The HTTP status code.
     */
    public constructor(msg: string, status: HTTPStatusCode = HTTPStatusCode.INTERNAL_SERVER_ERROR) {
        super(msg);

        this.status = status;
    }

    /**
     * Turn this HTTP error into a JSON object that
     * can be sent back to the client.
     *
     * @returns A JSON object containing the particular error message.
     */
    public toJSONReply(): object {
        return {
            msg: this.message,
        };
    }

}
