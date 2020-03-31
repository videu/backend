/**
 * @file JSON format specs for video data.
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

/**
 * A JSON object carrying video data either received from or sent to clients.
 */
export interface IVideoJSON {
    /** The video id. */
    id: string;
    /** The category id this video belongs to. */
    categoryId: string;
    /** The user id who uploaded this video. */
    userId: string;
    /** The video description. */
    description: string;
    /** The rating this video has. */
    rating: {
        /** The total amount of upvotes. */
        upvotes: number;
        /** The total amount of downvotes. */
        downvotes: number;
    };
    /** The video tags. */
    tags: string[];
    /** The time this video was uploaded as a UNIX timestamp in milliseconds. */
    time: number;
    /** The video title. */
    title: string;
    /** The amount of views this video has. */
    views: number;
}
