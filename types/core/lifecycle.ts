/**
 * @file Lifecycle interface definition.
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

import { SealedArray } from '../array';

/**
 * Something that owns a basic lifecycle, i.e. can be initialized and
 * de-initialized.
 *
 * @param T An optional parameter that is passed to the {@link #init} callback.
 */
export interface ILifecycle<InitArgs extends any[] = []> {

    /** Whether this is currently initialized. */
    readonly isInitialized: boolean;

    /** Initialize this instance. */
    init(...args: InitArgs): Promise<void>;

    /** De-initialize this instance. */
    exit(): Promise<void>;

}
