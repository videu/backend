/**
 * @file Type definitions for the `users` table.
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

import { IBaseDocument } from '../data/base-document';

export interface IUserSettings extends IBaseDocument<IUserSettings> {
    /** Whether this user is subscribed to the newsletter. */
    newsletter: boolean;
    /** Whether this user wants their profile picture shown publicly. */
    showPP: boolean;
}

export interface IUser extends IBaseDocument<IUser> {
    /** The activation token. */
    activationToken?: string;
    /** The display name. */
    dName: string;
    /** The email address. */
    email: string;
    /** The date this user signed up. */
    joined: Date;
    /** The user name in lowercase. */
    lName: string;
    /** The bcrypt hash of the password. */
    passwd: string;
    /** The user settings. */
    settings: IUserSettings;
    /** The amount of subscribers. */
    subCount: number;
    /** The actual user name. */
    uName: string;
    /** Whether this user has their email address verified. */
    v: boolean;
}
