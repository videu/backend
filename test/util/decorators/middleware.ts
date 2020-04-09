/**
 * Unit test for the middleware decorator.
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

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';

import { FMWFactory, FMWFactoryConfigurator } from '../../../types/routes/middleware';

import { middleware } from '../../../src/util/decorators/middleware';

import { StubAuthSubsys } from '../../dummy/core/auth-subsys';
import { StubMongoSubsys } from '../../dummy/core/mongo-subsys';
import { StubStorageSubsys } from '../../dummy/core/storage-subsys';
import { EmptyRoute } from '../../dummy/routes/route';

chai.use(chaiAsPromised);

describe('util/decorators/middleware:middleware', () => {
    const mongoSubsys = new StubMongoSubsys();
    const storageSubsys = new StubStorageSubsys();
    const authSubsys = new StubAuthSubsys();

    before(async () => {
        await mongoSubsys.init();
        await storageSubsys.init(mongoSubsys);
        await authSubsys.init(storageSubsys);
    });

    after(async () => {
        await authSubsys.exit();
        await storageSubsys.exit();
        await mongoSubsys.exit();
    });

    it('should initialize an undefined middleware object', () => {
        const emptyRoute = new EmptyRoute(authSubsys, storageSubsys);
        const factory: FMWFactory = (_log, _auth, _storage) => (_req, _res, _next) => { return; };
        middleware(factory)(emptyRoute, 'get');

        return expect(emptyRoute.middleware).to.deep.eq({
            get: [factory],
            post: [],
            put: [],
            delete: [],
            patch: [],
        });
    });

    it('should add another middleware to the beginning of the chain', () => {
        const emptyRoute = new EmptyRoute(authSubsys, storageSubsys);
        const factory: FMWFactory = (_log, _auth, _storage) => (_req, _res, _next) => { return; };
        middleware(factory)(emptyRoute, 'get');
        middleware(factory)(emptyRoute, 'get');

        return expect(emptyRoute.middleware).to.deep.eq({
            get: [factory, factory],
            post: [],
            put: [],
            delete: [],
            patch: [],
        });
    });

    it('should initialize configurable middleware factories', () => {
        const emptyRoute = new EmptyRoute(authSubsys, storageSubsys);
        const config = { test: true };

        let configResult: any = null;
        const factoryConfigurator: FMWFactoryConfigurator<{ test: boolean; }> = param => {
            configResult = param;
            return (_log, _auth, _storage) => (_req, _res, _next) => { return; };
        };
        middleware(factoryConfigurator, config)(emptyRoute, 'get');
        return expect(configResult).to.deep.eq(config);
    });
});
