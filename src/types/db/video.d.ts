/**
 * @file Type definitions for `video` objects.
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

import { IBaseDocument, FToClientJSON } from '../data/base-document';
import { ObjectId } from 'bson';

/**
 * Represents the rating cache for a video.
 * Note that this is only a *cache* for faster data access, the `ratings`
 * table contains the official rating data.
 */
export interface IVideoRating extends IBaseDocument<IVideoRating> {
    /** The amount of upvotes. */
    u: number;
    /** The amount of downvotes. */
    d: number;
}

/**
 * Represents a single document in the `videos` table.
 */
export interface IVideo extends IBaseDocument<IVideo> {
    /** The video id. */
    _id: ObjectId;
    /** The category id this video belongs to. */
    category_id: ObjectId;
    /** The user id who uploaded this video. */
    user_id: ObjectId;
    /** The video description. */
    description: string;
    /** The rating this video has. */
    rating: IVideoRating;
    /** The video tags. */
    tags: Array<string>;
    /** The time this video was uploaded. */
    time: Date;
    /** The video title. */
    title: string;
    /** The amount of views this video has. */
    views: number;
}
