/**
 * Data source for users using mongoose.
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

import { ObjectId } from 'mongodb';

import { IMinimalUserData, IUserDataAuthority } from '../../../../types/data/data-source/user';
import { IUser } from '../../../../types/db/user';

import { User } from '../../../model/user';

/**
 * The authoritative data source for usesr data.
 */
export class MongoUserDataSource implements IUserDataAuthority {

    /** @inheritdoc */
    public readonly isPersistent: boolean = true;

    /** @inheritdoc */
    public async create(data: IMinimalUserData): Promise<IUser> {
        if (data._id === undefined) {
            data._id = new ObjectId();
        }

        const user = new User(data);
        await user.save();
        return user;
    }

    /** @inheritdoc */
    public async delete(doc: IUser): Promise<void> {
        await User.deleteOne({ _id: doc.id });
    }

    /** @inheritdoc */
    public async activate(challengeToken: string): Promise<IUser | null> {
        return await User.findOneAndUpdate(
            { activationToken: challengeToken },
            {
                activationToken: null,
                v: true,
            }
        );
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
    public async update(user: IUser): Promise<void> {
        await user.save();
    }

    /**
     * Find a user with the specified email or user name.
     *
     * @param userName The user name.
     * @param email The mail address.
     * @returns The colliding user, or `null` if there is none.
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
