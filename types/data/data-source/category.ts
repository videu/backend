/**
 * @file Data source interface definition for categories.
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

import { Binary, ObjectId } from 'mongodb';

import { ICategory } from '../../db/category';
import { IVideo } from '../../db/video';
import { IDataSource } from '../data-source';

export interface IMinimalCategoryData {
    _id?: ObjectId;
    name: string;
    description: string;
    tags?: string[];
}

/**
 * Base interface for all data sources suppling category information.
 */
export interface ICategoryDataSource extends IDataSource<ICategory> {

    /**
     * Create a new category and save it to the database.
     *
     * @param data The category data.
     */
    create(data: IMinimalCategoryData): Promise<ICategory>;

    /**
     * Delete a category from the database.
     *
     * @param id The category id.
     */
    delete(id: ObjectId): Promise<void>;

    /**
     * Get a category by its id.
     *
     * @param id The category id.
     * @returns A Promise for the category object, or `null` if it was not found.
     */
    getById(id: ObjectId): Promise<ICategory | null>;

    /**
     * Get an array of recent videos posted in this category sorted by date.
     *
     * @param id The category id.
     * @param limit The maximum amount of results per page.
     * @param page The results page (starting from `0`).
     * @returns The videos.
     */
    getRecentVideos(id: ObjectId, limit: number, page: number): Promise<IVideo[] | null>;

    /**
     * Update a category in the database.
     *
     * @param category The category.
     */
    update(category: ICategory): Promise<void>;

}
