/**
 * @file Dummy data provider for various category objects.
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

import { Category } from '../../../src/model/category';
import { ICategory } from '../../../types/db/category';

export const DUMMY_CATEGORIES: ICategory[] = [
    new Category({
        _id: new ObjectId(),
        children: [],
        name: 'Test 0',
        desc: 'Top-level category',
        tags: ['0'],
    }),
    new Category({
        _id: new ObjectId(),
        children: [],
        name: 'Test 1',
        desc: 'Child of Test 0',
        tags: ['0', '1'],
    }),
    new Category({
        _id: new ObjectId(),
        children: [],
        name: 'Test 2',
        desc: 'Child of Test 0',
        tags: ['2'],
    }),
    new Category({
        _id: new ObjectId(),
        children: [],
        name: 'Test 3',
        desc: 'Child of Test 1',
        tags: ['3'],
    }),
];

DUMMY_CATEGORIES[0].children.push(DUMMY_CATEGORIES[1]._id);
DUMMY_CATEGORIES[1].parent_id = DUMMY_CATEGORIES[0]._id;

DUMMY_CATEGORIES[0].children.push(DUMMY_CATEGORIES[2]._id);
DUMMY_CATEGORIES[2].parent_id = DUMMY_CATEGORIES[0]._id;

DUMMY_CATEGORIES[1].children.push(DUMMY_CATEGORIES[3]._id);
DUMMY_CATEGORIES[3].parent_id = DUMMY_CATEGORIES[1]._id;
