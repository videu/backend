/**
 * @file Type definitions for the logging interface.
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
 * Base interface for all loggers.
 */
export interface ILogger {

    /** Log a debug message to the console. */
    d(msg: string, err?: Error): void;

    /** Log a verbose message to the console. */
    v(msg: string, err?: Error): void;

    /** Log an info message to the console. */
    i(msg: string): void;

    /** Log a warning message to the console. */
    w(msg: string, err?: Error): void;

    /** Log an error message to the console. */
    e(msg: string, err?: Error): void;

    /** Log a severe message to the console. */
    s(msg: string, err?: Error): void;

    /**
     * What a Terrible Failure: Log an error that should not be able to happen
     * in the first place to the console.
     */
    wtf(msg: string, err?: Error): void;

}
