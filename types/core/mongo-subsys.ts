/**
 * Mongo subsystem interface definition.
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

import { IConfigurable } from '../configurable';
import { ICategoryDataAuthority } from '../data/data-source/category';
import { IUserDataAuthority } from '../data/data-source/user';
import { IVideoDataAuthority } from '../data/data-source/video';
import { IObjectSchema } from '../util/object-schema';
import { ISubsys } from './subsys';

/**
 * Configuration for the mongo subsystem.
 */
export interface IMongoConfig {
    /** The hostname to connect to. */
    host: string;
    /**
     * The port to connect to.
     * Defaults to `27017`.
     */
    port: number;
    /**
     * The database to use.
     * Defaults to `'videu'`.
     */
    db: string;
    /**
     * Whether to use an SSL connection.
     * Defaults to `true` if the `NODE_ENV` environment variable is set to
     * `production`, and `false` otherwise.  If `NODE_ENV` is `production` and
     * this is explicitly set to `false`, the server will refuse to start.
     */
    ssl: boolean;
    /**
     * The user name for authentication.
     * If this is an empty string, authentication is disabled.
     */
    userName: string;
    /**
     * The password for authentication.
     * If this is an empty string, authentication is disabled.
     */
    passwd: string;
    /**
     * The database to authenticate against.
     * Defaults to `'admin'`.
     */
    authSource: string;
}

/** Config validation schema for the mongo subsystem configuration object. */
export const MONGO_SUBSYS_CONFIG_SCHEMA: IObjectSchema = {
    host: {
        type: 'string',
        regex: /^(([1-9][0-9]{0,2})\.){3}([1-9][0-9]{0,2})|([a-z0-9\-](\.[a-z0-9\-])*)/i,
    },
    port: {
        type: 'number',
        default: 27017,
        range: [1, 65535],
    },
    db: {
        type: 'string',
        default: 'videu',
        regex: /^[a-z0-9]*([_\-][a-z0-9]+)*$/,
    },
    ssl: {
        type: 'boolean',
        default: process.env.NODE_ENV === 'production',
    },
    userName: {
        type: 'string',
        default: '',
    },
    passwd: {
        type: 'string',
        default: '',
    },
    authSource: {
        type: 'string',
        default: 'admin',
    },
};

/**
 * Base interface for the mongo subsystem.
 */
export interface IMongoSubsys extends ISubsys, IConfigurable<IMongoConfig> {

    /** The MongoDB data source for categories. */
    readonly categoryDataAuthority: ICategoryDataAuthority;

    /** The MongoDB data source for users. */
    readonly userDataAuthority: IUserDataAuthority;

    /** The MongoDB data source for videos. */
    readonly videoDataAuthority: IVideoDataAuthority;

}
