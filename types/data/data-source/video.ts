/**
 * @file Data source interface definition for videos.
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

import { IVideo } from '../../db/video';
import { IDataAuthority, IDataCache, IDataSource } from '../data-source';

/**
 * The minimal data required to create a new video document.
 */
export interface IMinimalVideoData {
    _id?: ObjectId;
    category_id: ObjectId;
    user_id: ObjectId;
    title: string;
    description: string;
}

/**
 * Base interface for video data sources.
 */
export interface IVideoDataSource extends IDataSource<IVideo> {

    /**
     * Get a video by its id.
     *
     * @param id The user id.
     * @return A Promise for the user object, or `null` if it was not found.
     */
    getById(id: ObjectId): Promise<IVideo | null>;

    /**
     * Return an array of all videos one user uploaded.
     *
     * @param userId The user id.
     * @param limit The maximum amount of entries (for pagination).
     * @param page The results page (for pagination, `0`-based).
     */
    getAllByUser(userId: ObjectId, limit: number, page: number): Promise<IVideo[] | null>;

    /**
     * Get recently uploaded videos belonging to a specific category.
     *
     * @param categoryId The category id.
     * @param limit The maximum amount of entries (for pagination).
     * @param page The results page (for pagination, `0`-based).
     */
    getRecentsByCategory(categoryId: ObjectId, limit: number,
                         page: number): Promise<IVideo[] | null>;

}

export interface IVideoDataAuthority
extends IVideoDataSource, IDataAuthority<IVideo, IMinimalVideoData> {}

export interface IVideoDataCache
extends IVideoDataSource, IDataCache<IVideo> {}
