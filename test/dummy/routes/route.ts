/**
 * @file Dummy implementation of category data sources.
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

import { IAuthSubsys } from '../../../types/core/auth-subsys';
import { IStorageSubsys } from '../../../types/core/storage-subsys';

import { AbstractRoute } from '../../../src/routes/abstract-route';

import { StubAuthSubsys } from '../core/auth-subsys';
import { StubStorageSubsys } from '../core/storage-subsys';

export class EmptyRoute extends AbstractRoute {

    public authSubsys: IAuthSubsys;

    public storageSubsys: IStorageSubsys;

    constructor(authSubsys: IAuthSubsys = new StubAuthSubsys(),
                storageSubsys: IStorageSubsys = new StubStorageSubsys()) {
        super('', authSubsys, storageSubsys);

        this.authSubsys = authSubsys;
        this.storageSubsys = storageSubsys;
    }

}
