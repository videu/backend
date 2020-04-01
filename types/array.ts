/**
 * @file Type definitions for some special forms of arrays.
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

/** All properties of the `Array` class that allow for manipulating its length. */
type ArrayLengthMutationKeys = 'splice' | 'push' | 'shift' | 'unshift' | number;

/** All items in an array of fixed length. */
type ArrayItems<T extends any[]> = T extends Array<infer TItems> ? TItems : never;

/** An array of fixed length and strong typing on a per-index basis. */
export type SealedArray<T extends any[]> =
    Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
    & { [Symbol.iterator]: () => IterableIterator<ArrayItems<T>> };
