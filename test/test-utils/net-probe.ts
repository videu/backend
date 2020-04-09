/**
 * Test utility for probing network connections.
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

import { stat } from 'fs';
import { Socket } from 'net';

/**
 * Probe a TCP port and throw an error if it is unreachable.
 *
 * @param port The port to probe.
 * @param host The host (defaults to `'127.0.0.1'`).
 * @param timeout The timeout in milliseconds (defaults to `1000`).
 */
export function probeTCP(port: number, host: string = '127.0.0.1', timeout: number = 1000):
Promise<void> {
    return new Promise((resolve, reject) => {
        const socket = new Socket();

        socket.setTimeout(timeout);
        socket.once('error', () => reject(new Error('Port unreachable')));
        socket.once('timeout', () => reject(new Error('Timeout')));

        socket.connect(port, host, () => {
            socket.end();
            resolve();
        });
    });
}

/**
 * Probe a UNIX socket and throw an error if it is unreachable.
 *
 * @param path The path to the UNIX socket.
 * @param timeout The timeout in milliseconds (defaults to `1000`).
 */
export function probeUNIX(path: string, timeout: number = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
        stat(path, (err, stats) => {
            if (err) {
                reject(new Error(`Cannot stat ${path}!!1!`));
                return;
            }

            if (!stats.isSocket()) {
                reject(new Error(`File ${path} is not a socket`));
                return;
            }

            const socket = new Socket();

            socket.setTimeout(timeout);
            socket.once('error', () => reject(new Error('Socket unreachable')));
            socket.once('timeout', () => reject(new Error('Timeout')));

            socket.connect(path, () => {
                socket.end(resolve);
            });
        });
    });
}
