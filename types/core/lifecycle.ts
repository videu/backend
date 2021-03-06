/**
 * Lifecycle interface definition.
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
 * All states of an {@linkcode ILifecycle}.
 */
export const enum LifecycleState {

    /**
     * The unit has been instantiated, but not initialized yet.
     * It is not ready for use.
     */
    CREATED = 0,

    /**
     * The unit has been initialized successfully and is ready to be used with
     * other components.
     */
    INITIALIZED = 1,

    /**
     * The unit has been de-initialized and cannot be used anymore.
     * It is not possible to re-initialize the same unit again.
     */
    EXITED = 2,

    /**
     * The initialization failed, the unit cannot be used.
     */
    ERROR = 3,

}

/**
 * Something that owns a basic lifecycle, i.e. can be initialized and
 * de-initialized.
 *
 * @typeParam InitArgs An optional parameter list that is passed to the
 *     {@linkcode .init} callback.
 */
export interface ILifecycle<InitArgs extends any[] = []> {

    /** The current state of this unit. */
    readonly state: LifecycleState;

    /** Initialize this instance. */
    init(...args: InitArgs): Promise<void>;

    /** De-initialize this instance. */
    exit(): Promise<void>;

}
