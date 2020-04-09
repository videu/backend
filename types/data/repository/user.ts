/**
 * User repository interface definition.
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

import { IUser } from '../../db/user';
import { IMinimalUserData, IUserDataAuthority, IUserDataCache } from '../data-source/user';
import { IRepository } from '../repository';

export interface IUserRepository
extends IRepository<IUser, IMinimalUserData, IUserDataAuthority, IUserDataCache> {

    /**
     * Activate a user account.
     * Throws an error if the challenge token was not found.
     *
     * @param challengeToken The activation token sent via email.
     * @returns The user object.
     */
    activate(challengeToken: string): Promise<IUser>;

    /**
     * Get a user by their email address.
     *
     * @param email The email address.
     * @returns The user, or `null` if they were not found.
     */
    getByEmail(email: string): Promise<IUser | null>;

    /**
     * Get a user by their unique id.
     *
     * @param id The user id.
     * @returns The user, or `null` if they were not found.
     */
    getById(id: ObjectId): Promise<IUser | null>;

    /**
     * Get a user by their user (@) name.
     *
     * @param userName The user name.
     * @returns The user, or `null` if they were not found.
     */
    getByUserName(userName: string): Promise<IUser | null>;

    /**
     * The same as create, but also checks for email and user name collisions.
     *
     * @param userData The user data.
     * @returns The new user.
     */
    register(userData: IMinimalUserData): Promise<IUser>;

}
