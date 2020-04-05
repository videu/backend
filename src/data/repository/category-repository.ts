/**
 * @file The category repository.
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

import { ObjectId } from 'mongodb';

import {
    ICategoryDataAuthority,
    ICategoryDataCache,
    IMinimalCategoryData,
} from '../../../types/data/data-source/category';
import { ICategoryRepository } from '../../../types/data/repository/category';
import { ICategory } from '../../../types/db/category';
import { IVideo } from '../../../types/db/video';
import { ILogger } from '../../../types/logger';

import { Logger } from '../../util/logger';
import { MongoCategoryDataSource } from '../data-source/category/mongo';
import { AbstractRepository } from './abstract-repository';

/**
 * The category repository.
 */
export class CategoryRepository extends AbstractRepository<
    ICategory,
    IMinimalCategoryData,
    ICategoryDataAuthority,
    ICategoryDataCache
> implements ICategoryRepository {

    public readonly authority: ICategoryDataAuthority;

    protected caches: ICategoryDataCache[] = [];

    constructor(logger: ILogger, authority: ICategoryDataAuthority) {
        super(logger);

        this.authority = authority;
    }

    /** @inheritdoc */
    public async getById(id: ObjectId): Promise<ICategory | null> {
        for (const cache of this.caches) {
            try {
                const hit: ICategory | null = await cache.getById(id);
                if (hit !== null) {
                    return hit;
                }
            } catch (err) {
                this.logger.e(`Cache error in retrieving category id ${id.toHexString()}`, err);
            }
        }

        const finalHit = await this.authority.getById(id);
        if (finalHit !== null) {
            const promises: Array<Promise<void>> = [];
            for (const cache of this.caches) {
                promises.push(cache.put(finalHit));
            }
            try {
                Promise.all(promises);
            } catch (err) {
                this.logger.e('Caching error', err);
            }
        }

        return finalHit;
    }

    /** @inheritdoc */
    public async getChain(id: ObjectId): Promise<ICategory[] | null> {
        const chain: ICategory[] = [];
        let currentId: ObjectId | undefined = id;
        while (currentId) {
            const currentCategory: ICategory | null = await this.getById(currentId);
            if (currentCategory === null) {
                break;
            }

            chain.push(currentCategory);
            currentId = currentCategory.parent_id;
        }

        if (chain.length === 0) {
            return null;
        } else {
            return chain;
        }
    }

    /** @inheritdoc */
    public async getRecentVideos(id: ObjectId, limit: number = 50,
                                 page: number = 0): Promise<IVideo[] | null> {
        // TODO
        return null;
    }

}

/* TODO: Just implement the route subsystem so this gets obsolete ffs */
export const categoryRepo = new CategoryRepository(
    new Logger('deprecated'),
    new MongoCategoryDataSource()
);
