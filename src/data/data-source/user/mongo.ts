/**
 * @file Data source for users using mongoose.
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

import { User } from '../../../model/user';
import { IMinimalUserData, IUserDataSource } from '../../../types/data/data-source/user';
import { IUser } from '../../../types/db/user';

/**
 * User data source for MongoDB.
 */
export class MongoUserDataSource implements IUserDataSource {

    /** @inheritdoc */
    public readonly isLocal: boolean = false;
    /** @inheritdoc */
    public readonly isPersistent: boolean = true;

    public async create(user: IMinimalUserData): Promise<IUser> {
        return await User.create(user);
    }

    /** @inheritdoc */
    public async delete(id: ObjectId): Promise<void> {
        await User.deleteOne({ _id: id });
    }

    /** @inheritdoc */
    public async getByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email: email });
    }

    /** @inheritdoc */
    public async getById(id: ObjectId): Promise<IUser | null> {
        return await User.findById(id);
    }

    /** @inheritdoc */
    public async getByUserName(userName: string): Promise<IUser | null> {
        return await User.findOne({ lName: userName.toLowerCase() });
    }

    /** @inheritdoc */
    public store(user: IUser): Promise<void> {
        return new Promise((resolve, reject) => reject(new Error('Unimplemented')));
    }

    /** @inheritdoc */
    public async update(user: IUser): Promise<void> {
        await User.update(null, user).exec();
    }

    /**
     *
     * @param userName The user name.
     * @param email The mail address.
     */
    public async findCollidingUser(userName: string, email: string): Promise<IUser | null> {
        return await User.findOne({
            $or: [
                { email: email },
                { uName: userName },
            ],
        });
    }

}
