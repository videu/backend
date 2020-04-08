/**
 * @file Unit test for the AbstractRoute class.
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

import { HTTPStatusCode } from '../../types/json/response';
import { FMWFactory } from '../../types/routes/middleware';

import { IllegalStateError } from '../../src/error/illegal-state-error';
import { REQUEST_METHODS } from '../../src/routes/abstract-route';

import { StubAuthSubsys } from '../dummy/core/auth-subsys';
import { StubHTTPSubsys } from '../dummy/core/http-subsys';
import { StubMongoSubsys } from '../dummy/core/mongo-subsys';
import { StubStorageSubsys } from '../dummy/core/storage-subsys';
import { MockRequest } from '../dummy/routes/request';
import { MockResponse } from '../dummy/routes/response';
import { EmptyRoute } from '../dummy/routes/route';

chai.use(chaiAsPromised);

describe('routes/abstract-route:AbstractRoute', () => {
    const mongoSubsys = new StubMongoSubsys();
    const storageSubsys = new StubStorageSubsys();
    const httpSubsys = new StubHTTPSubsys();
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

    it('should reject initializing twice', () => {
        const fn = async () => {
            const emptyRoute = new EmptyRoute(authSubsys, storageSubsys);
            try {
                await emptyRoute.init();
                await emptyRoute.init();
            } finally {
                await emptyRoute.exit();
            }
        };

        return expect(fn()).to.eventually.be.rejectedWith(IllegalStateError);
    });

    it('should reject exiting twice', () => {
        const fn = async () => {
            const emptyRoute = new EmptyRoute(authSubsys, storageSubsys);
            await emptyRoute.init();
            await emptyRoute.exit();
            await emptyRoute.exit();
        };

        return expect(fn()).to.eventually.be.rejectedWith(IllegalStateError);
    });

    for (const method of REQUEST_METHODS) {
        it(`should instantiate ${method.toUpperCase()} middlewares`, () => {
            let called: boolean = false;

            const testMiddlewareFactory: FMWFactory = (_logger, _authSubsys, _storageSubsys) => {
                called = true;
                return () => new Promise<void>(resolve => resolve());
            };

            const fn = async () => {
                const emptyRoute = new EmptyRoute(authSubsys, storageSubsys);
                emptyRoute.middleware = {
                    get: [],
                    post: [],
                    put: [],
                    delete: [],
                    patch: [],
                };
                emptyRoute.middleware[method].push(testMiddlewareFactory);
                await emptyRoute.init();
                await emptyRoute.exit();
                return called;
            };

            return expect(fn()).to.eventually.eq(true);
        });
    }

    for (const method of REQUEST_METHODS) {
        it(`should return HTTP/405 for non-overridden ${method.toUpperCase()} methods`, () => {
            const fn = async () => {
                const emptyRoute = new EmptyRoute(authSubsys, storageSubsys);
                await emptyRoute.init();
                const mockRequest = new MockRequest(httpSubsys.express);
                const mockResponse = new MockResponse(httpSubsys.express, mockRequest);
                await emptyRoute[method](mockRequest, mockResponse);
                return mockResponse.statusCode;
            };

            return expect(fn()).to.eventually.eq(HTTPStatusCode.METHOD_NOT_ALLOWED);
        });
    }
});
