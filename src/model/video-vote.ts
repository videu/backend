/**
 * @file Mongoose schema and model definition for the `video_votes` table.
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

import { IVideoVote } from '../types/db/video-vote';

/** Mongoose schema for the `video_votes` table. */
export const videoVoteSchema: Schema<IVideoVote> = new Schema<IVideoVote>({
    video_id: {
        type: ObjectId,
        index: true,
    },
    user_id: {
        type: ObjectId,
        index: true,
    },
    val: Boolean,
}, { _id: false });

videoVoteSchema.methods.toClientJSON =
    function(this: IVideoVote, showPrivates?: boolean): object {
        return {
            video_id: this.video_id,
            user_id: this.user_id,
            val: this.val,
        };
    };

/** Mongoose model for the `video_votes` table. */
export const VideoVote: Model<IVideoVote> =
    mongooseModel('VideoVote', videoVoteSchema);
