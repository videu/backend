/**
 * @file Dummy implementation of the user repository.
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
    IMinimalUserData,
    IUserDataCache,
} from '../../../../types/data/data-source/user';
import { IUserRepository } from '../../../../types/data/repository/user';
import { IUser } from '../../../../types/db/user';

import { StubUserDataAuthority } from '../data-source/user';

/**
 * Stub implementation of the user repository.
 */
export class StubUserRepository implements IUserRepository {

    public authority: StubUserDataAuthority = new StubUserDataAuthority();

    public async create(_data: IMinimalUserData): Promise<IUser> {
        throw new Error('User register() instead');
    }

    public delete(user: IUser): Promise<void> {
        return this.authority.delete(user);
    }

    public async update(user: IUser): Promise<IUser> {
        await this.authority.update(user);
        return user;
    }

    public getById(id: ObjectId): Promise<IUser | null> {
        return this.authority.getById(id);
    }

    public getByEmail(email: string): Promise<IUser | null> {
        return this.authority.getByEmail(email);
    }

    public getByUserName(userName: string): Promise<IUser | null> {
        return this.authority.getByUserName(userName);
    }

    public register(data: IMinimalUserData): Promise<IUser> {
        return this.authority.create(data);
    }

    public addCache(_cache: IUserDataCache) {
        return;
    }

    public getCaches(): IUserDataCache[] {
        return [];
    }

}
