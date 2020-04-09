/**
 * Unit test for the auth subsystem.
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

import { expect } from 'chai';
import { unlink } from 'fs';
import { describe } from 'mocha';
import { ObjectId } from 'mongodb';

import { IAuthConfig } from '../../types/core/auth-subsys';

import { AuthSubsys } from '../../src/core/auth-subsys';
import { AuthError } from '../../src/error/auth-error';
import { InvalidConfigError } from '../../src/error/invalid-config-error';
import { User } from '../../src/model/user';
import { asyncStat } from '../../src/util/fs';

import { IllegalStateError } from '../../src/error/illegal-state-error';
import { StubStorageSubsys } from '../dummy/core/storage-subsys';
import { DUMMY_USERS } from '../dummy/data/user';

class AuthSubsysChild extends AuthSubsys {

    /** Get the return value of `readConfigFromEnv()`. */
    public getConfig(): IAuthConfig {
        return this.readConfigFromEnv();
    }

}

const TEST_CONFIG: IAuthConfig = {
    algo: 'ES512',
    expire: 3600,
    publicKeyFile: 'test/dummy/util/test-certs/valid.pub.pem',
    privateKeyFile: 'test/dummy/util/test-certs/valid.priv.der',
};

describe('core/auth-subsys:AuthSubsys', () => {
    it('should initialize normally', () => {
        const fn = async () => {
            const subsys = new AuthSubsys(TEST_CONFIG);
            await subsys.init(new StubStorageSubsys());
            await subsys.exit();
        };

        return expect(fn()).to.eventually.fulfilled;
    });

    it('should read config from env correctly', () => {
        process.env.VIDEU_AUTH_ALGO = TEST_CONFIG.algo;
        process.env.VIDEU_AUTH_EXPIRE = TEST_CONFIG.expire.toString();
        process.env.VIDEU_AUTH_PUBLIC_KEY_FILE = TEST_CONFIG.publicKeyFile;
        process.env.VIDEU_AUTH_PRIVATE_KEY_FILE = TEST_CONFIG.privateKeyFile;

        const subsys = new AuthSubsysChild(null);
        return expect(subsys.getConfig()).to.deep.eq(TEST_CONFIG);
    });

    it('should generate signing certificates in development mode', () => {
        const promise = new Promise(async (resolve, reject) => {
            const envBefore = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const subsys = new AuthSubsys({
                algo: TEST_CONFIG.algo,
                expire: TEST_CONFIG.expire,
                publicKeyFile: 'test/core/jwt-test-not-found.pub.pem',
                privateKeyFile: 'test/core/jwt-test-not-found.priv.pem',
            });

            try {
                await subsys.init(new StubStorageSubsys());
                await subsys.exit();
                await asyncStat('test/core/jwt-test-not-found.pub.pem');
                await asyncStat('test/core/jwt-test-not-found.priv.pem');
            } catch (err) {
                process.env.NODE_ENV = envBefore;
                reject(err);
                return;
            }

            process.env.NODE_ENV = envBefore;

            unlink('test/core/jwt-test-not-found.pub.pem', () => {
                unlink('test/core/jwt-test-not-found.priv.pem', resolve);
            });
        });

        return expect(promise).to.eventually.be.fulfilled;
    });

    it('should refuse to start w/out key files in production mode', () => {
        const promise = new Promise(async (resolve, reject) => {
            const envBefore = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const subsys = new AuthSubsys({
                algo: TEST_CONFIG.algo,
                expire: TEST_CONFIG.expire,
                publicKeyFile: 'test/core/jwt-test-not-found.pub.pem',
                privateKeyFile: 'test/core/jwt-test-not-found.priv.pem',
            });

            try {
                await subsys.init(new StubStorageSubsys());
                await subsys.exit();
            } catch (err) {
                process.env.NODE_ENV = envBefore;
                reject(err);
                return;
            }

            /*
             * If we make it to here, the test has failed (because no error was
             * thrown), but that also means the files have been created, so we
             * have to clean up.
             */

            process.env.NODE_ENV = envBefore;

            unlink('test/core/jwt-test-not-found.pub.pem', () => {
                unlink('test/core/jwt-test-not-found.priv.pem', resolve);
            });
        });

        return expect(promise).to.eventually.be.rejectedWith(InvalidConfigError);
    });

    it('should throw an error if only public key exists', () => {
        const fn = async () => {
            const subsys = new AuthSubsys({
                algo: TEST_CONFIG.algo,
                expire: TEST_CONFIG.expire,
                publicKeyFile: TEST_CONFIG.publicKeyFile,
                privateKeyFile: 'nonexistent-file.pem',
            });
            await subsys.init(new StubStorageSubsys());
        };

        return expect(fn()).to.eventually.be.rejectedWith(InvalidConfigError);
    });

    it('should throw an error if only private exists', () => {
        const fn = async () => {
            const subsys = new AuthSubsys({
                algo: TEST_CONFIG.algo,
                expire: TEST_CONFIG.expire,
                publicKeyFile: 'nonexistent-file.pem',
                privateKeyFile: TEST_CONFIG.privateKeyFile,
            });
            await subsys.init(new StubStorageSubsys());
        };

        return expect(fn()).to.eventually.be.rejectedWith(InvalidConfigError);
    });

    it('should sign a JWT', () => {
        const fn = async () => {
            const subsys = new AuthSubsys(TEST_CONFIG);
            await subsys.init(new StubStorageSubsys());

            return await subsys.sign(DUMMY_USERS[0]);
        };

        return expect(fn()).to.eventually.be.a('string');
    });

    it('should verify a valid JWT', () => {
        const fn = async () => {
            const subsys = new AuthSubsys(TEST_CONFIG);
            await subsys.init(new StubStorageSubsys());

            const jwt = await subsys.sign(DUMMY_USERS[0]);
            return ( await subsys.verify(jwt) ).toPublicJSON().id;
        };

        return expect(fn()).to.eventually.eq(DUMMY_USERS[0].id);
    });

    it('should reject signing before initialization', () => {
        return expect(new AuthSubsys(TEST_CONFIG).sign(DUMMY_USERS[0]))
            .to.eventually.be.rejectedWith(IllegalStateError);
    });

    it('should reject verifying before initialization', () => {
        return expect(new AuthSubsys(TEST_CONFIG).verify(''))
            .to.eventually.be.rejectedWith(IllegalStateError);
    });

    it('should reject a JWT issued to a non-existent user', () => {
        const fn = async () => {
            const subsys = new AuthSubsys(TEST_CONFIG);
            await subsys.init(new StubStorageSubsys());

            const jwt = await subsys.sign(new User({
                _id: new ObjectId(),
                uName: 'non-existent',
                email: 'non@existent.net',
                passwd: 'not-hashed',
            }));
            await subsys.verify(jwt);
        };

        return expect(fn()).to.eventually.be.rejectedWith(AuthError);
    });

    it('should reject a modified JWT', () => {
        const fn = async () => {
            const subsys = new AuthSubsys(TEST_CONFIG);
            await subsys.init(new StubStorageSubsys());

            let jwt = await subsys.sign(DUMMY_USERS[0]);
            jwt = jwt.substring(0, 21) + 'a' + jwt.substring(21);
            await subsys.verify(jwt);
        };

        return expect(fn()).to.eventually.be.rejectedWith(AuthError);
    });
});
