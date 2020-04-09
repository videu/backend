/**
 * Video repository interface definition.
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

import { IVideo } from '../../db/video';
import { IMinimalVideoData, IVideoDataAuthority, IVideoDataCache } from '../data-source/video';
import { IRepository } from '../repository';

/**
 * Interface for the video repository.
 */
export interface IVideoRepository
extends IRepository<IVideo, IMinimalVideoData, IVideoDataAuthority, IVideoDataCache> {

    /**
     * Get a video by its id.
     *
     * @param id The video id.
     * @returns The video, or `null` if it does not exist.
     */
    getById(id: ObjectId): Promise<IVideo | null>;

    /**
     * Get all videos of the specified user with pagination.
     *
     * @param userId The user id.
     * @param limit The maximum amount of results per page.
     * @param page The page.
     * @returns An array of videos created by the specified user, or `null` if
     *     there aren't any.
     */
    getAllByUser(userId: ObjectId, limit?: number, page?: number): Promise<IVideo[] | null>;

}
