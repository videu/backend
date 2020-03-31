/**
 * @file Mongoose schema and model definition for the `videos` table.
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
import { Model, model as createModel, Schema } from 'mongoose';

import { IVideo, IVideoRating } from '../../types/db/video';

/** Mongoose schema for the `rating` field in the `videos` table. */
export const videoRatingSchema: Schema<IVideoRating> = new Schema<IVideoRating>({
    u: {
        type: Number,
        default: 0,
    },
    d: {
        type: Number,
        default: 0,
    },
});

/** Mongoose schema for the `videos` table. */
export const videoSchema: Schema<IVideo> = new Schema<IVideo>({
    category_id: {
        type: ObjectId,
        index: true,
    },
    user_id: {
        type: ObjectId,
        index: true,
    },
    description: String,
    rating: videoRatingSchema,
    tags: [String],
    time: {
        type: Date,
        default: Date.now,
        index: true,
    },
    title: String,
    views: Number,
});

videoSchema.methods.toPublicJSON = function() {
    return {
        id: this.id,
        userId: this.user_id.toHexString(),
        categoryId: this.category_id.toHexString(),
        description: this.description,
        rating: {
            upvotes: this.rating.u,
            downvotes: this.rating.d,
        },
        tags: this.tags,
        time: this.time.getTime(),
        title: this.title,
        views: this.views,
    };
};

/** Mongoose model for the `videos` table. */
export const Video: Model<IVideo> =
    createModel<IVideo>('Video', videoSchema);
