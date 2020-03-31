/**
 * @file Base interface definition for repositories.
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

import { IDataSource } from './data-source';

/**
 * Base interface for all repositories.
 *
 * A repository is the top level of the upstream data flow hierarchy.  It is the
 * interface that routers interact with in order to get their data, and its sole
 * responsibility is to select an appropriate data source for obtaining said
 * data.
 *
 * @param T The Document type this repository takes care of.
 */
export interface IRepository<T extends Document> {

    /**
     * Add a data source to this repository.
     *
     * @param dataSource The data source.
     */
    addDataSource(dataSource: IDataSource<T>): void;

    /**
     * Return an array of all data sources this repository can consult.
     *
     * @returns All data sources.
     */
    getDataSources(): Array<IDataSource<T>>;

}
