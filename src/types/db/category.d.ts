/**
 * @file Type definitions for the `categories` table.
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
import { Document } from 'mongoose';

import { IBaseDocument } from '../data/base-document';
import IRepository from '../data/repository';

/**
 * Interface definition for categories.
 */
export interface ICategory extends IBaseDocument<ICategory> {
    /** The parent category id, or `undefined` if this is a top-level category. */
    parent_id?: ObjectId;
    /** All child categories. */
    children: ObjectId[];
    /** The category name. */
    name: string;
    /** The category description. */
    desc: string;
    /** Some keywords for searching. */
    tags: string[];
}
