/**
 * @file Base interface definition for all subsystems.
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

import { ILifecycle } from './lifecycle';
import { IVideu } from './videu';

/**
 * Base interface for subsystems.
 *
 * A subsystem is a major component of the application that requires
 * initialization on server start and cleanup on server stop.
 */
export interface ISubsys extends ILifecycle<IVideu> {

    /** The unique name. Should be an all-lowercase alphanumeric string. */
    readonly id: string;

    /** Whether this subsystem is currently initialized. */
    readonly isInitialized: boolean;

    /**
     * An array of subsystem ids that this subsys requires in order to function.
     * Any subsystem that is in this array is guaranteed to have been
     * initialized before this one.  Similarily, this subsystem is guaranteed to
     * be de-initialized before any in this array.  If there is a conflict
     * (i.e. two subsystems `want`ing each other), the server will refuse to
     * start all together.
     */
    readonly wants: string[];

}
