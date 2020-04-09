/**
 * JSON format specs for user data.
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

/**
 * A JSON object carrying user data either received from or sent to clients.
 */
export interface IUserJSON {
    /** The user ID as a hex-encoded binary string. */
    id: string;
    /** The user (at-) name. */
    userName: string;
    /** The display name. */
    displayName: string;
    /** The UNIX timestamp (in milliseconds) when this user first joined. */
    joined: number;
    /** The amount of subscribers. */
    subCount: number;
}

/**
 * A JSON object carrying user data either received from or sent to clients.
 * This contains sensitive private information that may only be sent to
 * authenticated requests.
 */
export interface IPrivateUserJSON extends IUserJSON {
    /** The user's email address. */
    email: string;
    /** All global settings. */
    settings: {
        /** Whether this user would like to receive newsletters. */
        newsletter: boolean;
        /** Whether to show this user's profile picture publicly. */
        showPP: boolean;
    };
}

/**
 * A JSON object containing all data that is sent to the backend when a new user
 * wants to sign up.
 */
export interface IUserSignupJSON {
    /** The user name. */
    userName: string;
    /** The password in plain text. */
    passwd: string;
    /** The display name. */
    displayName: string;
    /** The email address. */
    email: string;
    /** All settings. */
    settings: {
        /** Whether to receive newsletters. */
        newsletter: boolean;
        /** Whether to show the profile picture publicly. */
        showPP: boolean;
    };
}
