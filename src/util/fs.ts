/**
 * @file Promisified wrappers for various APIs from the `fs` package.
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

import {
    PathLike,
    readFile as readFileInternal,
    stat as statInternal,
    Stats,
    writeFile as writeFileInternal,
} from 'fs';

/**
 * Get the stats for a file using `fs.stat()`.
 *
 * @param path The path to the file.
 * @return The stats.
 */
export function stat(path: PathLike): Promise<Stats> {
    return new Promise((resolve, reject) => {
        statInternal(path, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve(stats);
            }
        });
    });
}

/**
 * Read a file to a `Buffer` using `fs.readFile()`.
 *
 * @param path The path to the file.
 * @return A `Buffer` containing the file's data.
 */
export function readFile(path: PathLike): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        readFileInternal(path, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * Read a file using `fs.readFile()` and decode it to a string directly.
 * The file is assumed to be in UTF-8 encoding.
 *
 * @param path The path to the file.
 * @return The file contents as a string.
 */
export async function readFileStr(path: PathLike): Promise<string> {
    return new TextDecoder('utf-8').decode(await readFile(path));
}

/**
 * Write `data` to a file using `fs.writeFile()`.
 *
 * @param path The path to the file.
 * @param data The data to write to.
 */
export function writeFile(path: PathLike, data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
        writeFileInternal(path, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Encode a string to UTF-8 raw data and write them to a file
 * using `fs.writeFile()`.
 *
 * @param path The path to the file.
 * @param data The data to write to.
 */
export function writeFileStr(path: PathLike, data: string): Promise<void> {
    return writeFile(path, Buffer.from(data, 'utf-8'));
}
