/**
 * @file Interface definition for the express subsystem.
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

import { PathLike } from 'fs';
import { Server as HTTPServer } from 'http';

import { IConfigurable } from '../configurable';
import { IRoute } from '../routes/route';
import { IObjectSchema } from '../util/object-schema';
import { IRouteSubsys } from './route-subsys';
import { ISubsys } from './subsys';

/**
 * Configuration structure for the HTTP server subsystem.
 */
export interface IHTTPConfig {
    /** The host name or IP address to listen on. */
    host: string;
    /**
     * The TCP port to listen on.
     * Defaults to `4201`.  If this is set to `-1`, the server will not listen
     * on any TCP socket.
     */
    port: number;
    /**
     * The UNIX socket to listen on.
     * If this is an empty string, the server will not listen on any socket.
     */
    socket: PathLike;
    /**
     * The octal file access mode for the UNIX socket.
     * Defaults to `0o770`.
     */
    socketMode: number;
}

/** HTTP server config schema. */
export const HTTP_SUBSYS_CONFIG_SCHEMA: IObjectSchema = {
    host: {
        type: 'string',
        default: '127.0.0.1',
    },
    port: {
        type: 'number',
        default: 4201,
        range: [-1, 65535],
    },
    socket: {
        type: 'string',
        default: '',
    },
    socketMode: {
        type: 'number',
        default: 0o770,
    },
};

/**
 * Interface for the express management subsystem.
 */
export interface IHTTPSubsys extends ISubsys<[IRouteSubsys]>, IConfigurable<IHTTPConfig> {

    /**
     * Listen on a TCP port.
     * This is usually not needed as the port is parsed from the config.
     *
     * @param port The port.
     * @return The newly created HTTP server.
     */
    listenTCP(host: string, port: number): Promise<HTTPServer>;

    /**
     * Listen on a UNIX socket.
     * This is usually not needed as the socket is parsed from the config.
     * The behavior of this method is completely unknown on Windows systems.
     *
     * @param socket The path to the socket.
     * @param mode The octal file permissions.
     * @return The newly created HTTP server.
     */
    listenUNIX(socket: PathLike, mode?: number): Promise<HTTPServer>;

    /**
     * Change a setting in Express.
     *
     * @param setting The setting name.
     * @param val The value.
     */
    set(setting: string, val: any): void;

    /**
     * Include the specified route in the express routing tree.
     * You only need to do this for top-level routes as they already contain all
     * of their children.
     *
     * @param route The route.
     */
    use(route: IRoute): void;

}
