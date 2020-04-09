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

import {
    IMinimalVideoData,
    IVideoDataAuthority,
    IVideoDataCache
} from '../../../types/data/data-source/video';
import { IVideoRepository } from '../../../types/data/repository/video';
import { IVideo } from '../../../types/db/video';
import { ILogger } from '../../../types/logger';

import { AbstractRepository } from './abstract-repository';

/**
 * The video repository.
 */
export class VideoRepository
extends AbstractRepository<IVideo, IMinimalVideoData, IVideoDataAuthority, IVideoDataCache>
implements IVideoRepository {

    /** @inheritdoc */
    public readonly authority: IVideoDataAuthority;

    /** @inheritdoc */
    protected caches: IVideoDataCache[] = [];

    public constructor(logger: ILogger, authority: IVideoDataAuthority) {
        super(logger);

        this.authority = authority;
    }

    /** @inheritdoc */
    public async getById(id: ObjectId): Promise<IVideo | null> {
        for (const cache of this.caches) {
            try {
                const hit = await cache.getById(id);
                if (hit !== null) {
                    return hit;
                }
            } catch (err) {
                this.logger.e(`Cache access error for video id ${id.toHexString()}`, err);
            }
        }

        const finalHit = await this.authority.getById(id);
        if (finalHit !== null) {
            const promises: Array<Promise<void>> = [];
            for (const cache of this.caches) {
                promises.push(cache.put(finalHit));
            }
            try {
                await Promise.all(promises);
            } catch (err) {
                this.logger.e('Caching error', err);
            }
        }

        return finalHit;
    }

    /** @inheritdoc */
    public async getAllByUser(userId: ObjectId, limit: number = 1000,
                              page: number = 0): Promise<IVideo[] | null> {
        return await this.authority.getAllByUser(userId, limit, page);
    }

    /** @inheritdoc */
    public async getRecentsByCategory(categoryId: ObjectId, limit: number = 100,
                                      page: number = 0): Promise<IVideo[] | null> {
        // TODO
        return null;
    }

}
