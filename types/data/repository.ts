/**
 * Base interface definition for repositories.
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

import { Document } from 'mongoose';

import { IDataAuthority, IDataCache } from './data-source';

/**
 * Base interface for all repositories.
 *
 * A repository is the top level of the upstream data flow hierarchy.  It is the
 * interface that routers interact with in order to get their data, and its sole
 * responsibility is to select an appropriate data source for obtaining said
 * data.
 *
 * @typeParam T The Document type this repository takes care of.
 * @typeParam M The minimal data required to create new documents.
 * @typeParam A The data authority for this repository.
 * @typeParam C The interface for caches for this repository.
 */
export interface IRepository<
    T extends Document,
    M extends object,
    A extends IDataAuthority<T, M>,
    C extends IDataCache<T>
> {

    /**
     * The authoritative data source for this repository.
     * If there are any conflicts in the caches, the entry in this data source
     * always wins.  This also has to be the first data source that is modified
     * on any operation.
     */
    readonly authority: A;

    /**
     * Create a new document and store it at least in the authoritative data
     * source.  A {@linkcode ConflictError} may be thrown if there are
     * conflicting documents in the authoritative data source.
     *
     * @param data The data for the new document.
     * @returns The new document.
     * @throws A {@linkcode ConflictError} If the user name or email is already
     *     used by another account.
     */
    create(data: M): Promise<T>;

    /**
     * Delete a document from all data sources.
     *
     * @param doc The document to delete.
     */
    delete(doc: T): Promise<void>;

    /**
     * Update a document in all data sources.
     *
     * @param doc The document.
     * @returns The updated document.
     */
    update(doc: T): Promise<T>;

    /**
     * Add a cache to this repository.
     *
     * @param cache The data source.
     */
    addCache(cache: C): void;

    /**
     * Return an array of all caches this repository has.
     *
     * @returns All caches.
     */
    getCaches(): C[];

}
