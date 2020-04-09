/**
 * Dummy implementation of video data sources.
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

import {
    IMinimalVideoData,
    IVideoDataAuthority,
    IVideoDataCache,
} from '../../../../types/data/data-source/video';
import { IVideo } from '../../../../types/db/video';

import { Video } from '../../../../src/model/video';
import { DUMMY_VIDEOS } from '../video';

export class StubVideoDataAuthority implements IVideoDataAuthority {

    public readonly isPersistent: boolean = true;

    private videos: Map<string, IVideo> = new Map();

    constructor(initialData: IVideo[] = DUMMY_VIDEOS) {
        for (const video of initialData) {
            this.videos.set(video.id, new Video({
                _id: video._id,
                category_id: video.category_id,
                user_id: video.user_id,
                description: video.description,
                rating: {
                    u: video.rating.u,
                    d: video.rating.d,
                },
                tags: [ ...video.tags ],
                time: new Date(video.time.getTime()),
                title: video.title,
                views: video.views,
            }));
        }
    }

    public async create(data: IMinimalVideoData): Promise<IVideo> {
        const video = new Video(data);
        if (this.videos.has(video.id)) {
            throw new Error('Video id already exists');
        }

        this.videos.set(video.id, video);
        return video;
    }

    public async delete(video: IVideo): Promise<void> {
        this.videos.delete(video.id);
    }

    public async update(video: IVideo): Promise<void> {
        if (!this.videos.has(video.id)) {
            throw new Error('Video not found');
        }

        /*
         * probably not needed as the video object is likely modified in-memory,
         * but hey why take the chance?
         */
        this.videos.set(video.id, video);
    }

    public async getById(id: ObjectId): Promise<IVideo | null> {
        return this.videos.get(id.toHexString()) || null;
    }

    public async getAllByUser(userId: ObjectId, limit: number, page: number): Promise<IVideo[]> {
        const hits: IVideo[] = [];

        for (const video of this.videos.values()) {
            if (video.user_id.toHexString() === userId.toHexString()) {
                hits.push(video);
            }
        }

        return hits;
    }

    public async getRecentsByCategory(categoryId: ObjectId): Promise<IVideo[]> {
        const hits: IVideo[] = [];

        for (const video of this.videos.values()) {
            if (video.category_id.toHexString() === categoryId.toHexString()) {
                hits.push(video);
            }
        }

        return hits;
    }

}

export class StubVideoDataCache implements IVideoDataCache {

    public videos: Map<string, IVideo> = new Map();

    public readonly metric: number = 100;

    public readonly isPersistent: boolean = false;

    public async delete(video: IVideo): Promise<void> {
        this.videos.delete(video.id);
    }

    public async put(video: IVideo): Promise<void> {
        this.videos.set(video.id, video);
    }

    public async update(video: IVideo): Promise<void> {
        this.videos.set(video.id, video);
    }

    public async getById(id: ObjectId): Promise<IVideo | null> {
        return this.videos.get(id.toHexString()) || null;
    }

    public async getAllByUser(userId: ObjectId, limit: number, page: number): Promise<IVideo[]> {
        const hits: IVideo[] = [];

        for (const video of this.videos.values()) {
            if (video.user_id.toHexString() === userId.toHexString()) {
                hits.push(video);
            }
        }

        return hits;
    }

    public async getRecentsByCategory(categoryId: ObjectId): Promise<IVideo[]> {
        const hits: IVideo[] = [];

        for (const video of this.videos.values()) {
            if (video.category_id.toHexString() === categoryId.toHexString()) {
                hits.push(video);
            }
        }

        return hits;
    }

}
