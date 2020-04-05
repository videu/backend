/**
 * @file Dummy implementation of user data sources.
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
} from '../../../../types/data/data-source/category';
import { ICategory } from '../../../../types/db/category';
import { IVideo } from '../../../../types/db/video';

import { Category } from '../../../../src/model/category';
import { DUMMY_CATEGORIES } from '../category';

export class StubCategoryDataAuthority implements ICategoryDataAuthority {

    public readonly isPersistent: boolean = true;

    private categories: Map<string, ICategory> = new Map();

    constructor(initialData: ICategory[] = DUMMY_CATEGORIES) {
        for (const category of initialData) {
            this.categories.set(category.id, new Category({
                _id: category._id,
                parent_id: category.parent_id,
                children: [ ...category.children ],
                name: category.name,
                desc: category.desc,
                tags: [ ...category.tags ],
            }));
        }
    }

    public async create(data: IMinimalCategoryData): Promise<ICategory> {
        const category = new Category(data);
        if (this.categories.has(category.id)) {
            throw new Error('Category already exists');
        }

        this.categories.set(category.id, category);
        return category;
    }

    public async delete(category: ICategory): Promise<void> {
        this.categories.delete(category.id);
    }

    public async update(category: ICategory): Promise<void> {
        if (!this.categories.has(category.id)) {
            throw new Error('Category not found');
        }

        /*
         * probably not needed as the user object is likely modified in-memory,
         * but hey why take the chance?
         */
        this.categories.set(category.id, category);
    }

    public async getById(id: ObjectId): Promise<ICategory | null> {
        return this.categories.get(id.toHexString()) || null;
    }

    public async getRecentVideos(userId: ObjectId): Promise<IVideo[] | null> {
        return null;
    }

}

export class StubCategoryDataCache implements ICategoryDataCache {

    public categories: Map<string, ICategory> = new Map();

    public readonly metric: number = 100;

    public readonly isPersistent: boolean = false;

    public async delete(category: ICategory): Promise<void> {
        this.categories.delete(category.id);
    }

    public async put(category: ICategory): Promise<void> {
        this.categories.set(category.id, category);
    }

    public async update(category: ICategory): Promise<void> {
        this.categories.set(category.id, category);
    }

    public async getById(id: ObjectId): Promise<ICategory | null> {
        return this.categories.get(id.toHexString()) || null;
    }

    public async getRecentVideos(userId: ObjectId): Promise<IVideo[] | null> {
        return null;
    }

}
