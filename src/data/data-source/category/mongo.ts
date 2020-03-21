/**
 * @file Data source for categories using mongoose.
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
    ICategoryDataSource,
    IMinimalCategoryData
} from '../../../../types/data/data-source/category';
import { ICategory } from '../../../../types/db/category';
import { IVideo } from '../../../../types/db/video';
import { Category } from '../../../model/category';
import { Video } from '../../../model/video';

/**
 * User data source for MongoDB.
 */
export class MongoCategoryDataSource implements ICategoryDataSource {

    /** @inheritdoc */
    public readonly isLocal: boolean = false;
    /** @inheritdoc */
    public readonly isPersistent: boolean = true;

    /** @inheritdoc */
    public async create(user: IMinimalCategoryData): Promise<ICategory> {
        return await Category.create(user);
    }

    /** @inheritdoc */
    public async delete(id: ObjectId): Promise<void> {
        await Category.deleteOne({ _id: id });
    }

    /** @inheritdoc */
    public async getById(id: ObjectId): Promise<ICategory | null> {
        return await Category.findById(id);
    }

    /** @inheritdoc */
    public async getRecentVideos(id: ObjectId, limit: number,
                                 page: number): Promise<IVideo[] | null> {
        return await Video
            .find({ category_id: id })
            .sort({ date: -1 })
            .limit(limit)
            .skip(page * limit)
            .exec();
    }

    /** @inheritdoc */
    public async update(category: ICategory): Promise<void> {
        await category.save();
    }

}
