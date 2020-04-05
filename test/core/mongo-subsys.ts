/**
 * @file Unit test for the mongo subsystem.
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
import { describe } from 'mocha';

import { IMongoConfig } from '../../types/core/mongo-subsys';

import { mongod } from '../dummy/mongod';

import { MongoSubsys } from '../../src/core/mongo-subsys';

class MongoSubsysChild extends MongoSubsys {

    /** Get the return value of `readConfigFromEnv()`. */
    public getConfig(): IMongoConfig {
        return this.readConfigFromEnv();
    }

}

describe('core/mongo-subsys:MongoSubsys', () => {
    it('should initialize normally', () => {
        const fn = async () => {
            const subsys = new MongoSubsys({
                host: '127.0.0.1',
                port: await mongod.getPort(),
                db: await mongod.getDbName(),
                authSource: 'admin',
                passwd: '',
                userName: '',
                ssl: false,
            });
            await subsys.init();
            await subsys.exit();
        };

        return expect(fn()).to.eventually.fulfilled;
    });

    it('should read config from env correctly', () => {
        process.env.VIDEU_MONGO_HOST = '1.2.3.4';
        process.env.VIDEU_MONGO_PORT = '12345';
        process.env.VIDEU_MONGO_DB = 'test';
        process.env.VIDEU_MONGO_AUTH_SOURCE = 'auth_source_test';
        process.env.VIDEU_MONGO_PASSWD = 'password_test';
        process.env.VIDEU_MONGO_USER_NAME = 'user_name_test';
        process.env.VIDEU_MONGO_SSL = 'false';

        const subsys = new MongoSubsysChild(null);
        return expect(subsys.getConfig()).to.deep.eq({
            host: '1.2.3.4',
            port: 12345,
            db: 'test',
            authSource: 'auth_source_test',
            passwd: 'password_test',
            userName: 'user_name_test',
            ssl: false,
        });
    });
});
