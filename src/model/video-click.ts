/**
 * @file Mongoose schema and model definition for the `video_clicks` table.
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
import { Model, model as mongooseModel, Schema } from 'mongoose';

import { IVideoClick } from '../types/db/video-click';

/** Mongoose schema for the `video_clicks` table. */
export const videoClickSchema: Schema<IVideoClick> = new Schema<IVideoClick>({
    video_id: {
        type: ObjectId,
        index: true,
    },
    user_id: {
        type: ObjectId,
        index: true,
    },
    ts: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

/** Mongoose model for the `video_clicks` table. */
export const VideoClick: Model<IVideoClick> =
    mongooseModel('VideoClick', videoClickSchema);
