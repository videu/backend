/**
 * @file Abstract base class for data sources using mongoose.
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

import { IBaseDocument } from '../../types/data/base-document';
import { IDataSource } from '../../types/data/data-source';

/**
 * Abstract base class for any data source that uses the mongoose API.
 */
export abstract class MongoDataSource<T extends IBaseDocument<T>>
implements IDataSource<T> {

    /** @inheritdoc */
    public readonly isLocal: boolean = false;

    /** @inheritdoc */
    public readonly isPersistent: boolean = true;

}
