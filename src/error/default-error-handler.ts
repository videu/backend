/**
 * The default error handler that all request handlers can pass their
 * errors to.
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

import { ErrorRequestHandler } from 'express';

import { BackendError } from './backend-error';

/** The catchall error handler. */
export const defaultErrReqHandler: ErrorRequestHandler = (err, req, res, next) => {
    let msg: string = 'Internal server error';

    if (err instanceof Error) {
        if (err instanceof BackendError) {
            res.status(err.statusCode).json(err.toJSON());
            return;
        } else if (typeof err.message === 'string') {
            msg = err.message;
        }
    }

    res.status(500).json({
        err: true,
        msg: msg,
    });
};
