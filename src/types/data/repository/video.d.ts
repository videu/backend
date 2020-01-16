/**
 * @file Video repository interface definition.
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
import { IVideo } from '../../db/video';
import { IMinimalVideoData } from '../data-source/video';
import { ConflictError } from '../../../error/conflict-error';

/**
 * Interface for the video repository.
 */
export interface IVideoRepository extends IRepository<IVideo> {
    /**
     * Create a new video.
     *
     * @param videoData The video data.
     * @returns The newly created video.
     * @throws A {@link ConflictError}
     *         if there are any fields conflicting with existing entries.
     */
    create(videoData: IMinimalVideoData): Promise<IVideo>;

    delete(id: ObjectId): Promise<void>;

    getById(id: ObjectId): Promise<IVideo | null>;
    getAllByUser(userId: ObjectId, limit?: number, page?: number): Promise<IVideo[] | null>;

    update(video: IVideo): Promise<void>;
}
