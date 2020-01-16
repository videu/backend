/**
 * @file Redis bootstrapper.
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

import redis from 'redis';

/** Redis database id for users. */
export const DB_USER: number            = 0;
/** Redis database id for videos. */
export const DB_VIDEO: number           = 1;
/** Redis database id for comments. */
export const DB_COMMENT: number         = 2;
/** Redis database id for categories. */
export const DB_CATEGORY: number        = 3;
/** Redis database id for video clicks. */
export const DB_VIDEO_CLICK: number     = 4;
/** Redis database id for video votes. */
export const DB_VIDEO_VOTE: number      = 5;
/** Redis database id for comment votes. */
export const DB_COMMENT_VOTE: number    = 6;
