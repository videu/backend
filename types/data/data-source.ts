/**
 * Base interface for data sources.
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
 * Base interface for all data sources.
 *
 * A data source is responsible for obtaining data from a single source, like a
 * cache or database server.  Respositories are the only element interacting
 * with data sources directly.
 *
 * @typeParam T The mongoose document type this DataSource manages.  This is
 *     required to ensure type safety when adding or removing data sources
 *     to/from a repository.  Methods from implementing classes may ONLY have
 *     return values of this type (or rather Promises for it).
 */
export interface IDataSource<T extends Document> {

    /**
     * If `true`, this data source is persistent; meaning that changes to it
     * are stored on disk rather than in memory and survive machine reboots.
     */
    readonly isPersistent: boolean;

    /**
     * Delete a document from this data source.
     * If the document didn't exist in the first place, do nothing.
     *
     * @param doc The document to delete.
     */
    delete(doc: T): Promise<void>;

    /**
     * Update a document in this data source.
     * The behavior when updating a document that did previously not exist in
     * the data source depends on whether this data source is an authority.
     * If it is, an error will be thrown.  If it is just a cache, the method
     * call will have the same effect as calling {@linkcode IDataCache.put}.
     *
     * @param doc The updated document.
     */
    update(doc: T): Promise<void>;

}

/**
 * Base interface for data authorities.
 * An authoritative data source is a persistent data source that stores the
 * "official" data for the platform.  If there is a mismatch between individual
 * caches, the data from this data source is always considered correct.
 * It should be obvious that there can only ever be one authority per data type.
 *
 * @typeParam T The mongoose document type.
 * @typeParam M The minimal data required to create a new document.
 */
export interface IDataAuthority<T extends Document, M extends object> extends IDataSource<T> {

    /**
     * Create a new document.
     * It is advisable to store the new document in the caches after this
     * operation is complete.
     *
     * @param data The data for this document.
     * @returns The new document.
     */
    create(data: M): Promise<T>;

}

/**
 * Base interface for caches.
 * A cache is a (usually non-persistent) data source that temporarily holds
 * frequently accessed data.  Unlike the authoritative data source, it may
 * contain incomplete or outdated data.
 *
 * @typeParam T The document type.
 */
export interface IDataCache<T extends Document> extends IDataSource<T> {

    /**
     * This cache's metric, i.e. how "slow" it is.  The repository managing this
     * cache will prioritize other ones over this one if their metric is lower.
     * In a nutshell, it's the same as in IP routing.
     */
    readonly metric: number;

    /**
     * Store a document in this cache.
     *
     * @param doc The document to cache.
     */
    put(doc: T): Promise<void>;

}
