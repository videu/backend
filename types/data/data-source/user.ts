/**
 * @file Data source interface definition for users.
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

import { IUser } from '../../db/user';
import { IDataSource } from '../data-source';

export interface IMinimalUserData {
    _id?: ObjectId;
    activationToken?: string;
    email: string;
    passwd: string;
    uName: string;
    settings?: {
        newsletter: boolean;
        showPP: boolean;
    };
}

/**
 * Base interface for all data sources suppling user information.
 */
export interface IUserDataSource extends IDataSource<IUser> {

    /**
     * Store a user in this data source.
     * If there is an existing entry violating unique index constraints,
     * the Promise gets rejected.
     *
     * @param data The user data.
     */
    create(data: IMinimalUserData): Promise<IUser>;

    /**
     * Delete a user from the data source.
     *
     * @param id The user id.
     */
    delete(id: ObjectId): Promise<void>;

    /**
     * Get a user by their email address.
     * If there is no user with the specified email address, the Promise
     * resolves to `null`.
     *
     * @param email The user's email address.
     * @returns A Promise for the user object, or `null` if it was not found.
     */
    getByEmail(email: string): Promise<IUser | null>;

    /**
     * Get a user by their id.
     * If the id does not exist, the Promise resolves to `null`.
     *
     * @param id The user id.
     * @return A Promise for the user object, or `null` if it was not found.
     */
    getById(id: ObjectId): Promise<IUser | null>;

    /**
     * Get a user by their user name (case-insensitive).
     * If the user name does not exist, the Promise resolves to `null`.
     *
     * @param userName The user name.
     * @return A Promise for the user object, or `null` if it was not found.
     */
    getByUserName(userName: string): Promise<IUser | null>;

    /**
     * Store a user in this data source.
     * This should only be used with caching data sources where all fields
     * required by the {@link IUser} are already known.  Persistent data sources
     * should always reject the returned Promise.
     *
     * @param user The user.
     */
    store(user: IUser): Promise<void>;

    /**
     * Update a user in the data source.
     * If the user did not exist before, the Promise gets rejected.
     *
     * @param user The user.
     */
    update(user: IUser): Promise<void>;

}