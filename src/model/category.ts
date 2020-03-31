/**
 * @file Mongoose schema and model definition for the `categories` table.
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

import { ICategory } from '../../types/db/category';

/** Mongoose schema for the `categories` table. */
export const categorySchema: Schema<ICategory> = new Schema<ICategory>({
    _id: ObjectId,
    parent_id: ObjectId,
    children: [ObjectId],
    name: String,
    desc: String,
    tags: [String],
});

categorySchema.methods.toPublicJSON = function() {
    const ret: any = {
        id: this.id,
        name: this.name,
        desc: this.desc,
        tags: this.tags,
        children: this.children,
    };

    if (this.parent_id) {
        ret.parent_id = this.parent_id.toHexString();
    }

    return ret;
};

/** Mongoose model for the `categories` table. */
export const Category: Model<ICategory> =
    createModel('Category', categorySchema);
