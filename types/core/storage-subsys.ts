/**
 * Storage subsystem interface definition.
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

import { ICategoryRepository } from '../data/repository/category';
import { IUserRepository } from '../data/repository/user';
import { IVideoRepository } from '../data/repository/video';
import { IMongoSubsys } from './mongo-subsys';
import { ISubsys } from './subsys';

/**
 * Base interface for the storage subsystem.
 * This subsystem is responsible for instantiating all repositories and adding
 * data sources to them.
 */
export interface IStorageSubsys extends ISubsys<[IMongoSubsys]> {

    /** The repository for categories. */
    readonly categoryRepo: ICategoryRepository;

    /** The repository for users. */
    readonly userRepo: IUserRepository;

    /** The repository for videos. */
    readonly videoRepo: IVideoRepository;

}
