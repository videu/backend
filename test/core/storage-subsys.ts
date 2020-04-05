/**
 * @file Unit test for the storage subsystem.
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

import { mongod } from '../dummy/mongod';

import { MongoSubsys } from '../../src/core/mongo-subsys';
import { StorageSubsys } from '../../src/core/storage-subsys';

describe('core/storage-subsys:StorageSubsys', () => {
    it('should initialize normally', () => {
        const fn = async () => {
            const mongoSubsys = new MongoSubsys({
                host: '127.0.0.1',
                port: await mongod.getPort(),
                db: await mongod.getDbName(),
                authSource: 'admin',
                passwd: '',
                userName: '',
                ssl: false,
            });
            const storageSubsys = new StorageSubsys();

            try {
                await mongoSubsys.init();
                await storageSubsys.init(mongoSubsys);

                await storageSubsys.exit();
            } finally {
                await mongoSubsys.exit();
            }
        };

        return expect(fn()).to.eventually.be.fulfilled;
    });
});
