/**
 * @file The video repository.
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

import { IDataSource } from '../../../types/data/data-source';
import { IMinimalVideoData, IVideoDataSource } from '../../../types/data/data-source/video';
import { IVideoRepository } from '../../../types/data/repository/video';
import { IVideo } from '../../../types/db/video';
import { MongoVideoDataSource } from '../data-source/video/mongo';

/**
 * The video repository.
 */
export class VideoRepository implements IVideoRepository {

    private mongoSource: MongoVideoDataSource;

    public constructor() {
        this.mongoSource = new MongoVideoDataSource();
    }

    /** @inheritdoc */
    public async create(data: IMinimalVideoData): Promise<IVideo> {
        return await this.mongoSource.create(data);
    }

    /** @inheritdoc */
    public async delete(id: ObjectId): Promise<void> {
        await this.mongoSource.delete(id);
    }

    /** @inheritdoc */
    public async getById(id: ObjectId): Promise<IVideo | null> {
        return await this.mongoSource.getById(id);
    }

    /** @inheritdoc */
    public async getAllByUser(userId: ObjectId, limit?: number,
                              page?: number): Promise<IVideo[] | null> {
        const _limit: number = typeof limit === 'number' ? limit : 1000;
        const _page: number = typeof page === 'number' ? page : 0;
        return await this.mongoSource.getAllByUser(userId, _limit, _page);
    }

    /** @inheritdoc */
    public async getRecentsByCategory(categoryId: ObjectId, limit: number = 100,
                                      page: number = 0): Promise<IVideo[] | null> {
        // TODO
        return null;
    }

    /** @inheritdoc */
    public async update(video: IVideo): Promise<void> {
        return await this.mongoSource.update(video);
    }

    /** @inheritdoc */
    public addDataSource(dataSource: IDataSource<IVideo>): void {
        throw new Error('Method not implemented.');
    }

    /** @inheritdoc */
    public getDataSources(): IVideoDataSource[] {
        return [this.mongoSource];
    }

}

export const videoRepo = new VideoRepository();
