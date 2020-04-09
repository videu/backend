/**
 * Dummy implementation of the category repository.
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

import { ObjectId } from 'mongodb';

import {
    ICategoryDataCache,
    IMinimalCategoryData,
} from '../../../../types/data/data-source/category';
import { ICategoryRepository } from '../../../../types/data/repository/category';
import { ICategory } from '../../../../types/db/category';
import { IVideo } from '../../../../types/db/video';

import { StubCategoryDataAuthority } from '../data-source/category';

/**
 * Stub implementation of the category repository.
 */
export class StubCategoryRepository implements ICategoryRepository {

    public authority: StubCategoryDataAuthority = new StubCategoryDataAuthority();

    public create(data: IMinimalCategoryData): Promise<ICategory> {
        return this.authority.create(data);
    }

    public delete(category: ICategory): Promise<void> {
        return this.authority.delete(category);
    }

    public async update(category: ICategory): Promise<ICategory> {
        await this.authority.update(category);
        return category;
    }

    public getById(id: ObjectId): Promise<ICategory | null> {
        return this.authority.getById(id);
    }

    public async getChain(id: ObjectId): Promise<ICategory[] | null> {
        let current: ICategory | null = await this.getById(id);
        if (current === null) {
            return null;
        }

        const chain: ICategory[] = [current];
        while (current.parent_id) {
            current = await this.getById(current.parent_id);
            if (current === null) {
                return null;
            }

            chain.push(current);
        }

        return chain;
    }

    public getRecentVideos(categoryId: ObjectId): Promise<IVideo[] | null> {
        return this.authority.getRecentVideos(categoryId);
    }

    public addCache(_cache: ICategoryDataCache) {
        return;
    }

    public getCaches(): ICategoryDataCache[] {
        return [];
    }

}
