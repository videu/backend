/**
 * @file Category repository interface definition.
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

import { IRepository } from '../repository';
import { ICategory } from '../../db/category';
import { IVideo } from '../../db/video';
import { IMinimalCategoryData } from '../data-source/category';

export interface ICategoryRepository extends IRepository<ICategory> {
    delete(id: ObjectId): Promise<void>;

    getById(id: ObjectId): Promise<ICategory | null>;
    getChain(id: ObjectId): Promise<ICategory[] | null>;

    getRecentVideos(id: ObjectId, limit?: number, page?: number): Promise<IVideo[] | null>;

    update(user: ICategory): Promise<void>;
}
