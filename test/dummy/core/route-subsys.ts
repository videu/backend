/**
 * @file Stub route subsystem implementation.
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

import { LifecycleState } from '../../../types/core/lifecycle';
import { IRouteSubsys } from '../../../types/core/route-subsys';
import { IRoute } from '../../../types/routes/route';

/**
 * Stub implementation of the route subsystem.
 */
export class StubRouteSubsys implements IRouteSubsys {

    public id: string = 'route';

    public state: LifecycleState = LifecycleState.CREATED;

    public routes: Map<string, IRoute> = new Map();

    public async init() {
        this.state = LifecycleState.INITIALIZED;
        for (const route of this.routes.values()) {
            await route.init();
        }
    }

    public async exit() {
        this.state = LifecycleState.EXITED;
        for (const route of this.routes.values()) {
            await route.exit();
        }
    }

}
