/**
 * Route subsystem implementation.
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

import { IAuthSubsys } from '../../types/core/auth-subsys';
import { IRouteSubsys } from '../../types/core/route-subsys';
import { IStorageSubsys } from '../../types/core/storage-subsys';
import { IRoute } from '../../types/routes/route';

import { InfoRoute } from '../routes/info/info-route';
import { UserRoute } from '../routes/user/user-route';
import { AbstractSubsys } from './abstract-subsys';

/**
 * The route subsystem.
 */
export class RouteSubsys
extends AbstractSubsys<[IAuthSubsys, IStorageSubsys]>
implements IRouteSubsys {

    /** @inheritdoc */
    public readonly routes: Map<string, IRoute> = new Map();

    /**
     * Instantiate the route subsystem.
     */
    public constructor() {
        super('route');
    }

    /** @inheritdoc */
    public async onInit(authSubsys: IAuthSubsys, storageSubsys: IStorageSubsys) {
        const infoRoute = new InfoRoute(authSubsys, storageSubsys);
        const userRoute = new UserRoute(authSubsys, storageSubsys);

        this.routes.set(infoRoute.name, infoRoute);
        this.routes.set(userRoute.name, userRoute);

        await infoRoute.init();
        await userRoute.init();
    }

    /** @inheritdoc */
    public async onExit() {
        return;
    }

}
