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

import { IDataSource } from '../../../types/data/data-source';
import {
    ICategoryDataSource,
    IMinimalCategoryData
} from '../../../types/data/data-source/category';
import { ICategoryRepository } from '../../../types/data/repository/category';
import { ICategory } from '../../../types/db/category';
import { IVideo } from '../../../types/db/video';
import { MongoCategoryDataSource } from '../data-source/category/mongo';

/**
 * The category repository.
 */
export class CategoryRepository implements ICategoryRepository {

    private mongoSource: MongoCategoryDataSource;

    public constructor() {
        this.mongoSource = new MongoCategoryDataSource();
    }

    /** @inheritdoc */
    public async create(category: IMinimalCategoryData): Promise<ICategory> {
        return await this.mongoSource.create(category);
    }

    /** @inheritdoc */
    public async delete(id: ObjectId): Promise<void> {
        await this.mongoSource.delete(id);
    }

    /** @inheritdoc */
    public async getById(id: ObjectId): Promise<ICategory | null> {
        return await this.mongoSource.getById(id);
    }

    /** @inheritdoc */
    public async getChain(id: ObjectId): Promise<ICategory[] | null> {
        const chain: ICategory[] = [];
        let currentId: ObjectId | undefined = id;
        while (currentId) {
            const currentCategory: ICategory | null = await this.mongoSource.getById(currentId);
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

    /** @inheritdoc */
    public async update(user: ICategory): Promise<void> {
        return await this.mongoSource.update(user);
    }

    /** @inheritdoc */
    public addDataSource(dataSource: IDataSource<ICategory>): void {
        throw new Error('Method not implemented.');
    }

    /** @inheritdoc */
    public getDataSources(): ICategoryDataSource[] {
        return [this.mongoSource];
    }

}

export const categoryRepo = new CategoryRepository();
