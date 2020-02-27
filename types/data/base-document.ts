/**
 * @file Type definitions for `video` objects.
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

import { Document } from 'mongoose';

/**
 * Transform this {@link Document} into a JSON object that is safe to send
 * to clients; i.e. does not contain anything users should not see.
 *
 * **Never** send anything other than the return value of this function to
 * clients, or you will literally combust into thousands of pieces.
 *
 * @param includePrivates If `true`, the returned JSON object may contain
 *                        sensitive data like email addresses.
 * @returns This document as a JSON object for clients.
 */
export type FToClientJSON<T extends IBaseDocument<T>> =
    (this: T, includePrivates?: boolean) => object;

/**
 * Base interface for any database type.
 */
export interface IBaseDocument<T extends IBaseDocument<T>> extends Document {
    /**
     * Transform this {@link Document} into a JSON object that is safe to send
     * to clients; i.e. does not contain anything users should not see.
     *
     * **Never** send anything other than the return value of this function to
     * clients, or you will literally combust into thousands of pieces.
     *
     * @param includePrivates If `true`, the returned JSON object may contain
     *                        sensitive data like email addresses.
     * @returns This document as a JSON object for clients.
     */
    toClientJSON: FToClientJSON<T>;
}
