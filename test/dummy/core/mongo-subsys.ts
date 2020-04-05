/**
 * @file Stub mongo subsystem implementation.
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
import { IMongoConfig, IMongoSubsys } from '../../../types/core/mongo-subsys';
import { ICategoryDataAuthority } from '../../../types/data/data-source/category';
import { IUserDataAuthority } from '../../../types/data/data-source/user';
import { IVideoDataAuthority } from '../../../types/data/data-source/video';

import { StubCategoryDataAuthority } from '../data/data-source/category';
import { StubUserDataAuthority } from '../data/data-source/user';
import { StubVideoDataAuthority } from '../data/data-source/video';

/**
 * Stub implementation of the mongo subsystem.
 */
export class StubMongoSubsys implements IMongoSubsys {

    public id: string = 'mongo';

    public state: LifecycleState = LifecycleState.INITIALIZED;

    public config: IMongoConfig = {
        host: '127.0.0.1',
        port: 27017,
        db: 'stub',
        ssl: false,
        authSource: 'admin',
        userName: '',
        passwd: '',
    };

    public readonly categoryDataAuthority: ICategoryDataAuthority = new StubCategoryDataAuthority();

    public readonly userDataAuthority: IUserDataAuthority = new StubUserDataAuthority();

    public readonly videoDataAuthority: IVideoDataAuthority = new StubVideoDataAuthority();

    public async init() {
        return;
    }

    public async exit() {
        return;
    }

}
