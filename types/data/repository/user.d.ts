/**
 * @file User repository interface definition.
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

import { IRepository } from '../repository';
import { IUser } from '../../db/user';
import { IMinimalUserData } from '../data-source/user';

export interface IUserRepository extends IRepository<IUser> {
    delete(id: ObjectId): Promise<void>;

    getByEmail(email: string): Promise<IUser | null>;
    getById(id: ObjectId): Promise<IUser | null>;
    getByUserName(userName: string): Promise<IUser | null>;

    register(userData: IMinimalUserData): Promise<IUser>;

    update(user: IUser): Promise<void>;
}