/**
 * @file Dummy data provider for various video objects.
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

import { Video } from '../../../src/model/video';
import { IVideo } from '../../../types/db/video';

import { DUMMY_CATEGORIES } from './category';
import { DUMMY_USERS } from './user';

export const DUMMY_VIDEOS: IVideo[] = [
    new Video({
        _id: new ObjectId(),
        category_id: DUMMY_CATEGORIES[0]._id,
        user_id: DUMMY_USERS[0]._id,
        description: 'Test video 0 description',
        rating: {
            u: 0,
            d: 0,
        },
        tags: ['video-0'],
        time: new Date('2020-04-20T00:00:00.000Z'),
        title: 'Test video 0',
        views: 0,
    }),
    new Video({
        _id: new ObjectId(),
        category_id: DUMMY_CATEGORIES[1]._id,
        user_id: DUMMY_USERS[1]._id,
        description: 'Test video 1 description',
        rating: {
            u: 100,
            d: 50,
        },
        tags: ['video-1'],
        time: new Date('2020-04-20T01:00:00.000Z'),
        title: 'Test video 1',
        views: 100,
    }),
    new Video({
        _id: new ObjectId(),
        category_id: DUMMY_CATEGORIES[2]._id,
        user_id: DUMMY_USERS[2]._id,
        description: 'Test video 2 description',
        rating: {
            u: 200,
            d: 400,
        },
        tags: ['video-2'],
        time: new Date('2020-04-20T02:00:00.000Z'),
        title: 'Test video 2',
        views: 200,
    }),
    new Video({
        _id: new ObjectId(),
        category_id: DUMMY_CATEGORIES[3]._id,
        user_id: DUMMY_USERS[2]._id,
        description: 'Test video 3 description',
        rating: {
            u: 3,
            d: 0,
        },
        tags: ['video-0'],
        time: new Date('2020-04-20T03:00:00.000Z'),
        title: 'Test video 3',
        views: 65,
    }),
];
