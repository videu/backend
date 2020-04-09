/**
 * Various sanitized conversion methods.
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

import { decNumberRegex } from './regex';

/**
 * Safely convert any value to a boolean.
 *
 * | `typeof val` | `val`             | return value |
 * | ------------ | ----------------- | ------------ |
 * | `'boolean'`  | `true`            | `true`       |
 * | `'boolean'`  | `false`           | `false`      |
 * | `'number'`   | `1`               | `true`       |
 * | `'number'`   | `0`               | `false`      |
 * | `'string'`   | `'true'`          | `true`       |
 * | `'string'`   | `'1'`             | `true`       |
 * | `'string'`   | `'false'`         | `false`      |
 * | `'string'`   | `'0'`             | `false`      |
 * | `'object'`   | `Boolean {true}`  | `true`       |
 * | `'object'`   | `Boolean {false}` | `false`      |
 * | `'object'`   | `Number {1}`      | `true`       |
 * | `'object'`   | `Number {0}`      | `false`      |
 *
 * @param val The value to cast.
 * @returns The boolean value of `val`, or `undefined` it it could not be
 * converted.
 */
export function toBoolSafe(val: any): boolean | undefined {
    switch (typeof val) {
        case 'boolean':
            return val;

        case 'string':
            if (val.toLowerCase() === 'true' || val === '1') {
                return true;
            }
            if (val.toLowerCase() === 'false' || val === '0') {
                return false;
            }
            break;

        case 'number':
            if (val === 1) {
                return true;
            }
            if (val === 0) {
                return false;
            }
            break;

        case 'object':
            if (val instanceof Boolean) {
                return val.valueOf();
            } else if (val instanceof Number) {
                if (val.valueOf() === 1) {
                    return true;
                } else if (val.valueOf() === 0) {
                    return false;
                }
            }
            break;
    }

    return undefined;
}

/**
 * Safely convert any value to an integer.
 *
 * | `typeof val` | `val`               | return value                |
 * | ------------ | ------------------- | --------------------------- |
 * | `'number'`   | `NaN`, `Infinity`   | `undefined`                 |
 * | `'number'`   | (any)               | `Math.floor(val)`           |
 * | `'boolean'`  | `false`             | `0`                         |
 * | `'boolean'`  | `true`              | `1`                         |
 * | `'string'`   | `/^-?\d+(\.\d+)?$/` | `Number.parseInt(val)`      |
 * | `'object'`   | `Boolean {false}`   | `0`                         |
 * | `'object'`   | `Boolean {true}`    | `1`                         |
 * | `'object'`   | `instanceof Number` | `Math.floor(val.valueOf())` |
 *
 * @param val The value to cast.
 * @returns The integer value of `val`, or `undefined` it it could not be
 * converted.
 */
export function toIntSafe(val: any): number | undefined {
    switch (typeof val) {
        case 'number':
            if (isFinite(val)) {
                return Math.floor(val);
            }
            break;

        case 'string':
            if (decNumberRegex.test(val)) {
                return Number.parseInt(val, 10);
            }
            break;

        case 'boolean':
            return val ? 1 : 0;

        case 'object':
            if (val instanceof Number) {
                if (isFinite(val.valueOf())) {
                    return Math.floor(val.valueOf());
                }
            } else if (val instanceof Boolean) {
                return val.valueOf() ? 1 : 0;
            }
            break;
    }

    return undefined;
}
