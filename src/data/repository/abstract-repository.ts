/**
 * The category repository.
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

import { IDataAuthority, IDataCache } from '../../../types/data/data-source';
import { IRepository } from '../../../types/data/repository';
import { ILogger } from '../../../types/logger';

/**
 * Abstract base class for all repositories.
 *
 * @typeParam T The type of the mongoose document.
 * @typeParam M The type of the minimal data required to create new documents.
 * @typeParam A The type of the data authority.
 * @typeParam C The type of data caches.
 */
export abstract class AbstractRepository<
    T extends Document,
    M extends object,
    A extends IDataAuthority<T, M>,
    C extends IDataCache<T>,
>
implements IRepository<T, M, A, C> {

    /*
     * These two properties are marked abstract because they are one of the most
     * frequently accessed properties in the entire application and we therefore
     * don't want to waste any time for prototype chain lookups.
     */

    /** @inheritdoc */
    public abstract readonly authority: A;

    /** @inheritdoc */
    protected abstract caches: C[];

    /** The logger. */
    protected logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    /* TODO: See if it's worth to make these three methods abstract like `authority` and `caches` */

    /** @inheritdoc */
    public async create(data: M): Promise<T> {
        const doc = await this.authority.create(data);

        const promises: Array<Promise<void>> = [];
        for (const cache of this.caches) {
            promises.push(cache.put(doc));
        }
        try {
            await Promise.all(promises);
        } catch (err) {
            this.logger.e('Caching error', err);
        }

        return doc;
    }

    /** @inheritdoc */
    public async delete(doc: T): Promise<void> {
        await this.authority.delete(doc);

        const promises: Array<Promise<void>> = [];
        for (const cache of this.caches) {
            promises.push(cache.delete(doc));
        }
        try {
            await Promise.all(promises);
        } catch (err) {
            this.logger.e('Caching error', err);
        }
    }

    /** @inheritdoc */
    public async update(doc: T): Promise<T> {
        const updated = await this.authority.update(doc);

        const promises: Array<Promise<void>> = [];
        for (const cache of this.caches) {
            promises.push(cache.delete(doc));
        }
        try {
            await Promise.all(promises);
        } catch (err) {
            this.logger.e('Cache delete error', err);
        }

        return doc;
    }

    /** @inheritdoc */
    public addCache(cache: C) {
        this.caches.push(cache);
        this.sortCaches();
    }

    /** @inheritdoc */
    public getCaches(): C[] {
        return this.caches;
    }

    /**
     * Sort the caches according to their metric.
     */
    protected sortCaches() {
        this.caches.sort((a, b) => a.metric - b.metric);
    }

}
