/**
 * @file Dummy implementation of user data sources.
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
    IUserDataAuthority,
    IUserDataCache,
} from '../../../../types/data/data-source/user';
import { IUser } from '../../../../types/db/user';

import { User } from '../../../../src/model/user';
import { DUMMY_USERS } from '../user';

export class StubUserDataAuthority implements IUserDataAuthority {

    public readonly isPersistent: boolean = true;

    private users: Map<string, IUser> = new Map();

    constructor(initialData: IUser[] = DUMMY_USERS) {
        for (const user of initialData) {
            this.users.set(user.id, new User({
                _id: user._id,
                dName: user.dName,
                email: user.email,
                joined: user.joined,
                lName: user.lName,
                passwd: user.passwd,
                settings: {
                    newsletter: user.settings.newsletter,
                    showPP: user.settings.showPP,
                },
                subCount: user.subCount,
                uName: user.uName,
            }));
        }
    }

    public async create(data: IMinimalUserData): Promise<IUser> {
        const user = new User(data);
        if (this.users.has(user.id)) {
            throw new Error('User already exists');
        }

        this.users.set(user.id, user);
        return user;
    }

    public async delete(user: IUser): Promise<void> {
        this.users.delete(user.id);
    }

    public async update(user: IUser): Promise<void> {
        if (!this.users.has(user.id)) {
            throw new Error('User not found');
        }

        /*
         * probably not needed as the user object is likely modified in-memory,
         * but hey why take the chance?
         */
        this.users.set(user.id, user);
    }

    public async findCollidingUser(userName: string, email: string): Promise<IUser | null> {
        const byUserName = await this.getByUserName(userName);
        const byEmail = await this.getByEmail(email);

        if (byUserName) {
            return byUserName;
        }

        if (byEmail) {
            return byEmail;
        }

        return null;
    }

    public async getByEmail(email: string): Promise<IUser | null> {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }

        return null;
    }

    public async getById(id: ObjectId): Promise<IUser | null> {
        return this.users.get(id.toHexString()) || null;
    }

    public async getByUserName(userName: string): Promise<IUser | null> {
        for (const user of this.users.values()) {
            if (user.uName === userName) {
                return user;
            }
        }

        return null;
    }

}

export class StubUserDataCache implements IUserDataCache {

    public users: Map<string, IUser> = new Map();

    public readonly metric: number = 100;

    public readonly isPersistent: boolean = false;

    public async delete(user: IUser): Promise<void> {
        this.users.delete(user.id);
    }

    public async put(user: IUser): Promise<void> {
        this.users.set(user.id, user);
    }

    public async update(user: IUser): Promise<void> {
        this.users.set(user.id, user);
    }

    public async getByEmail(email: string): Promise<IUser | null> {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }

        return null;
    }

    public async getById(id: ObjectId): Promise<IUser | null> {
        return this.users.get(id.toHexString()) || null;
    }

    public async getByUserName(userName: string): Promise<IUser | null> {
        for (const user of this.users.values()) {
            if (user.uName === userName) {
                return user;
            }
        }

        return null;
    }

}
