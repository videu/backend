/**
 * @file Dummy implementation of the video repository.
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

import {
    IMinimalVideoData,
    IVideoDataCache,
} from '../../../../types/data/data-source/video';
import { IVideoRepository } from '../../../../types/data/repository/video';
import { IVideo } from '../../../../types/db/video';

import { StubVideoDataAuthority } from '../data-source/video';

/**
 * Stub implementation of the video repository.
 */
export class StubVideoRepository implements IVideoRepository {

    public authority: StubVideoDataAuthority = new StubVideoDataAuthority();

    public create(data: IMinimalVideoData): Promise<IVideo> {
        return this.authority.create(data);
    }

    public delete(video: IVideo): Promise<void> {
        return this.authority.delete(video);
    }

    public async update(video: IVideo): Promise<IVideo> {
        await this.authority.update(video);
        return video;
    }

    public getById(id: ObjectId): Promise<IVideo | null> {
        return this.authority.getById(id);
    }

    public getAllByUser(userId: ObjectId, limit: number = 1000, page: number = 0):
    Promise<IVideo[] | null> {
        return this.authority.getAllByUser(userId, limit, page);
    }

    public addCache(_cache: IVideoDataCache) {
        return;
    }

    public getCaches(): IVideoDataCache[] {
        return [];
    }

}
