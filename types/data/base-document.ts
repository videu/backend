/**
 * @file Base interface definition for all documents.
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
 * @param showPrivates If `true`, the returned JSON
 * @param ShowPrivates The value of the regular `showPrivates` parameter; this
 *     is an auto-generated copy for typesafe return values.
 * @returns This document as a JSON object for clients.
 */
export type FToJSON<TIn extends Document, TOut> = (this: TIn) => TOut;

/**
 * Base interface for any database document type.
 *
 * @param T The type of the document, i.e. the interface extending this one.
 * @param TPubJSON The structure of JSON objects containing public data.
 * @param TPrivJSON The structure of JSON objects containing private data.
 */
export interface IBaseDocument<T extends Document, TPubJSON = void, TPrivJSON = void>
extends Document {

    /**
     * Return a JSON object containing all publicly-available data of this
     * document that can safely be sent to clients.  This is only available
     * if the `TPubJSON` type parameter is specified.
     *
     * @return This document as a JSON object.
     */
    toPublicJSON: TPubJSON extends void ? undefined : FToJSON<T, TPubJSON>;

    /**
     * Return a JSON object containing anything that {@link #toPublicJSON} does,
     * as well as additional sensitive data. The return value of this function
     * may only be sent to authenticated clients requesting their own data.
     * This is only available if the `TPrivJSON` parameter is not `void`.
     *
     * @return This document as a JSON object containing private details.
     */
    toPrivateJSON: TPrivJSON extends void ? undefined : FToJSON<T, TPrivJSON>;

}
