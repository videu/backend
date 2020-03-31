/**
 * @file Base interface for data sources.
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

import { Document } from 'mongoose';

/**
 * Base interface for all data sources.
 *
 * A data source is responsible for obtaining data from a single source, like a
 * cache or database server.  Respositories are the only element interacting
 * with data sources directly.
 *
 * @param T The mongoose document type this DataSource manages.  This is
 *     required to ensure type safety when adding or removing data sources
 *     to/from a repository.  Methods from implementing classes may ONLY have
 *     return values of this type (or rather Promises for it).
 */
export interface IDataSource<T extends Document> {

    /**
     * If `true`, this data source stores all data on the local machine and not
     * a network server.
     */
    readonly isLocal: boolean;

    /**
     * If `true`, this data source is persistent; meaning that changes to it
     * are stored on disk rather than in memory and survive machine reboots.
     */
    readonly isPersistent: boolean;

}
