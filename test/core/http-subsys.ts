/**
 * Unit test for the http subsystem.
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
import chaiHttp from 'chai-http';
import { describe } from 'mocha';

import { IHTTPConfig } from '../../types/core/http-subsys';
import { HTTPStatusCode } from '../../types/json/response';

import { StubAuthSubsys } from '../dummy/core/auth-subsys';
import { StubMongoSubsys } from '../dummy/core/mongo-subsys';
import { StubRouteSubsys } from '../dummy/core/route-subsys';
import { StubStorageSubsys } from '../dummy/core/storage-subsys';
import { StubRoute } from '../dummy/routes/route';
import { probeTCP, probeUNIX } from '../test-utils/net-probe';

import { HTTPSubsys } from '../../src/core/http-subsys';
import { IllegalStateError } from '../../src/error/illegal-state-error';
import { InvalidConfigError } from '../../src/error/invalid-config-error';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

class HTTPSubsysChild extends HTTPSubsys {

    /** Get the return value of `readConfigFromEnv()`. */
    public getConfig(): IHTTPConfig {
        return this.readConfigFromEnv();
    }

}

describe('core/http-subsys:HTTPSubsys', () => {
    const authSubsys = new StubAuthSubsys();
    const mongoSubsys = new StubMongoSubsys();
    const storageSubsys = new StubStorageSubsys();

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

    it('should initialize normally', () => {
        const fn = async () => {
            const routeSubsys = new StubRouteSubsys();
            await routeSubsys.init();

            const subsys = new HTTPSubsys({
                host: '127.0.0.1',
                port: 4201,
                socket: '',
                socketMode: 0o770,
            });
            await subsys.init(routeSubsys);
            await subsys.exit();
            await routeSubsys.exit();
        };

        return expect(fn()).to.eventually.be.fulfilled;
    });

    it('should read config from env correctly', () => {
        const envBefore = {
            host: process.env.VIDEU_HTTP_HOST,
            port: process.env.VIDEU_HTTP_PORT,
            socket: process.env.VIDEU_HTTP_SOCKET,
            socketMode: process.env.VIDEU_HTTP_SOCKET_MODE,
        };

        process.env.VIDEU_HTTP_HOST = '1.2.3.4';
        process.env.VIDEU_HTTP_PORT = '12345';
        process.env.VIDEU_HTTP_SOCKET = 'test';
        process.env.VIDEU_HTTP_SOCKET_MODE = '775';

        const config = new HTTPSubsysChild(null).getConfig();

        process.env.VIDEU_HTTP_HOST = envBefore.host;
        process.env.VIDEU_HTTP_PORT = envBefore.port;
        process.env.VIDEU_HTTP_SOCKET = envBefore.socket;
        process.env.VIDEU_HTTP_SOCKET_MODE = envBefore.socketMode;

        return expect(config).to.deep.eq({
            host: '1.2.3.4',
            port: 12345,
            socket: 'test',
            socketMode: 0o775,
        });
    });

    it('should listen on a TCP port', () => {
        const fn = async () => {
            const routeSubsys = new StubRouteSubsys();
            await routeSubsys.init();

            const subsys = new HTTPSubsys({
                host: '127.0.0.1',
                port: 4201,
                socket: '',
                socketMode: 0o770,
            });

            try {
                await subsys.init(routeSubsys);
            } catch (err) {
                await routeSubsys.exit();
                throw err;
            }

            try {
                await probeTCP(4201);
            } finally {
                try {
                    await subsys.exit();
                } finally {
                    await routeSubsys.exit();
                }
            }
        };

        return expect(fn()).to.eventually.be.fulfilled;
    });

    it('should listen on a UNIX socket', () => {
        const fn = async () => {
            const routeSubsys = new StubRouteSubsys();
            await routeSubsys.init();

            const subsys = new HTTPSubsys({
                host: '',
                port: -1,
                socket: 'test.sock',
                socketMode: 0o777,
            });

            try {
                await subsys.init(routeSubsys);
            } catch (err) {
                await routeSubsys.exit();
                throw err;
            }

            try {
                await probeUNIX('test.sock');
            } finally {
                try {
                    await subsys.exit();
                } finally {
                    await routeSubsys.exit();
                }
            }
        };

        return expect(fn()).to.eventually.be.fulfilled;
    });

    it('should not initialize w/out listen addresses specified', () => {
        const fn = async () => {
            const subsys = new HTTPSubsys({
                host: '',
                port: -1,
                socket: '',
                socketMode: 0o777,
            });
            const routeSubsys = new StubRouteSubsys();
            await routeSubsys.init();
            try {
                await subsys.init(routeSubsys);
            } finally {
                await routeSubsys.exit();
            }
        };

        return expect(fn()).to.eventually.be.rejectedWith(InvalidConfigError);
    });

    it('should reject calling listenTCP() before init', () => {
        const subsys = new HTTPSubsys();
        return expect(subsys.listenTCP('127.0.0.1', 4201))
            .to.eventually.be.rejectedWith(IllegalStateError);
    });

    it('should reject listening on the same port twice', () => {
        const fn = async () => {
            const subsys = new HTTPSubsys({
                host: '127.0.0.1',
                port: 4201,
                socket: '',
                socketMode: 0o777,
            });
            const routeSubsys = new StubRouteSubsys();
            await routeSubsys.init();

            await subsys.init(routeSubsys);
            try {
                await subsys.listenTCP('127.0.0.1', 4201);
            } finally {
                try {
                    await subsys.exit();
                } finally {
                    await routeSubsys.exit();
                }
            }
        };

        return expect(fn()).to.eventually.be.rejected;
    });

    it('should reject calling listenUNIX() before init', () => {
        const subsys = new HTTPSubsys();
        return expect(subsys.listenUNIX('test.sock', 0o777))
            .to.eventually.be.rejectedWith(IllegalStateError);
    });

    it('should reject listening on the same socket twice', () => {
        const fn = async () => {
            const subsys = new HTTPSubsys({
                host: '',
                port: -1,
                socket: 'test.sock',
                socketMode: 0o777,
            });
            const routeSubsys = new StubRouteSubsys();
            await routeSubsys.init();

            await subsys.init(routeSubsys);
            try {
                await subsys.listenUNIX('test.sock', 0o777);
            } finally {
                try {
                    await subsys.exit();
                } finally {
                    await routeSubsys.exit();
                }
            }
        };

        return expect(fn()).to.eventually.be.rejected;
    });

    it('should add a route to express', async () => {
        /* TODO: Clean this shit up */
        const routeSubsys = new StubRouteSubsys();
        const stubRoute = new StubRoute(authSubsys, storageSubsys);

        const httpSubsys = new HTTPSubsys({
            host: '127.0.0.1',
            port: 4201,
            socket: '',
            socketMode: 0o770,
        });

        routeSubsys.routes.set(stubRoute.name, stubRoute);
        await routeSubsys.init();

        try {
            await httpSubsys.init(routeSubsys);
        } catch (err) {
            await routeSubsys.exit();
            throw err;
        }

        let res: ChaiHttp.Response;
        try {
            res = await chai.request(httpSubsys.express).get(`/${stubRoute.name}`);
        } catch (err) {
            try {
                await httpSubsys.exit();
                throw err;
            } finally {
                await routeSubsys.exit();
            }
        }

        try {
            expect(res).to.have.status(HTTPStatusCode.OK);
            expect(res).to.be.an('object');
            expect(res.body).to.deep.eq({ err: false });
        } finally {
            try {
                await httpSubsys.exit();
            } finally {
                await routeSubsys.exit();
            }
        }
    });
});
