/**
 * Data source for videos using mongoose.
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

import { IMinimalVideoData, IVideoDataAuthority } from '../../../../types/data/data-source/video';
import { IVideo } from '../../../../types/db/video';

import { Video } from '../../../model/video';

/**
 * The authoritative data source for video data.
 */
export class MongoVideoDataSource implements IVideoDataAuthority {

    /** @inheritdoc */
    public readonly isPersistent: boolean = true;

    /** @inheritdoc */
    public async create(data: IMinimalVideoData): Promise<IVideo> {
        if (data._id === undefined) {
            data._id = new ObjectId();
        }

        const video = new Video(data);
        await video.save();
        return video;
    }

    /** @inheritdoc */
    public async delete(doc: IVideo): Promise<void> {
        await Video.deleteOne({ _id: doc.id });
    }

    /** @inheritdoc */
    public async getById(id: ObjectId): Promise<IVideo | null> {
        return await Video.findById(id);
    }

    /** @inheritdoc */
    public async getAllByUser(userId: ObjectId, limit: number,
                              page: number): Promise<IVideo[] | null> {
        const hits: IVideo[] | null = await Video
            .find({ user_id: userId })
            .sort({ date: -1 })
            .limit(limit)
            .skip(page * limit);

        if (Array.isArray(hits)) {
            return hits;
        } else if (hits === null) {
            return null;
        } else {
            return [hits];
        }
    }

    public async getRecentsByCategory(categoryId: ObjectId, limit: number,
                                      page: number): Promise<IVideo[] | null> {
        const hits: IVideo[] | IVideo = await Video
            .find({ category_id: categoryId })
            .sort({ date: -1 })
            .limit(limit)
            .skip(page * limit);

        if (Array.isArray(hits)) {
            return hits;
        } else if (hits === null) {
            return null;
        } else {
            return [hits];
        }
    }

    /** @inheritdoc */
    public async update(video: IVideo): Promise<void> {
        await video.save();
    }

}
