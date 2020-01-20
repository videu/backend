/**
 * @file The user repository.
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

import { IDataSource } from '../../../types/data/data-source';
import { IMinimalUserData, IUserDataSource } from '../../../types/data/data-source/user';
import { IUserRepository } from '../../../types/data/repository/user';
import { IUser } from '../../../types/db/user';
import { ConflictError } from '../../error/conflict-error';
import { MongoUserDataSource } from '../data-source/user/mongo';

/**
 * The user repository.
 */
export class UserRepository implements IUserRepository {

    private mongoSource: MongoUserDataSource;

    public constructor() {
        this.mongoSource = new MongoUserDataSource();
    }

    /** @inheritdoc */
    public async delete(id: ObjectId): Promise<void> {
        await this.mongoSource.delete(id);
    }

    /** @inheritdoc */
    public async getByEmail(email: string): Promise<IUser | null> {
        return await this.mongoSource.getByEmail(email);
    }

    /** @inheritdoc */
    public async getById(id: ObjectId): Promise<IUser | null> {
        return await this.mongoSource.getById(id);
    }

    /** @inheritdoc */
    public async getByUserName(userName: string): Promise<IUser | null> {
        return await this.mongoSource.getByUserName(userName);
    }

    /** @inheritdoc */
    public async register(userData: IMinimalUserData): Promise<IUser> {
        const collidingUser =
            await this.mongoSource.findCollidingUser(userData.uName, userData.email);

        if (collidingUser !== null) {
            if (userData.email === collidingUser.email) {
                throw new ConflictError('Email already exists');
            } else {
                throw new ConflictError('Username already exists');
            }
        }

        return await this.mongoSource.create(userData);
    }

    /** @inheritdoc */
    public async update(user: IUser): Promise<void> {
        return await this.mongoSource.update(user);
    }

    /** @inheritdoc */
    public addDataSource(dataSource: IDataSource<IUser>): void {
        throw new Error('Method not implemented.');
    }

    /** @inheritdoc */
    public getDataSources(): IUserDataSource[] {
        return [ this.mongoSource ];
    }

}

export const userRepo = new UserRepository();
