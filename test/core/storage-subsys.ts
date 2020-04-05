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

import { StubMongoSubsys } from '../dummy/core/mongo-subsys';

import { StorageSubsys } from '../../src/core/storage-subsys';
import { IllegalAccessError } from '../../src/error/illegal-access-error';

describe('core/storage-subsys:StorageSubsys', () => {
    it('should initialize normally', () => {
        const fn = async () => {
            const storageSubsys = new StorageSubsys();
            await storageSubsys.init(new StubMongoSubsys());
        };

        return expect(fn()).to.eventually.be.fulfilled;
    });

    it('should exit normally', () => {
        const fn = async () => {
            const storageSubsys = new StorageSubsys();
            await storageSubsys.init(new StubMongoSubsys());
            await storageSubsys.exit();
        };

        return expect(fn()).to.eventually.be.fulfilled;
    });

    it('should throw an error if accessing the categoryRepo before init', () => {
        const fn = () => {
            const storageSubsys = new StorageSubsys();
            return storageSubsys.categoryRepo;
        };

        return expect(fn).to.throw(IllegalAccessError);
    });

    it('should throw an error if accessing the userRepo before init', () => {
        const fn = () => {
            const storageSubsys = new StorageSubsys();
            return storageSubsys.userRepo;
        };

        return expect(fn).to.throw(IllegalAccessError);
    });

    it('should throw an error if accessing the videoRepo before init', () => {
        const fn = () => {
            const storageSubsys = new StorageSubsys();
            return storageSubsys.videoRepo;
        };

        return expect(fn).to.throw(IllegalAccessError);
    });

    it('should return the categoryRepo after successful init', () => {
        const fn = async () => {
            const storageSubsys = new StorageSubsys();
            await storageSubsys.init(new StubMongoSubsys());
            return storageSubsys.categoryRepo;
        };

        return expect(fn()).to.eventually.be.an('object');
    });

    it('should return the userRepo after successful init', () => {
        const fn = async () => {
            const storageSubsys = new StorageSubsys();
            await storageSubsys.init(new StubMongoSubsys());
            return storageSubsys.userRepo;
        };

        return expect(fn()).to.eventually.be.an('object');
    });

    it('should return the videoRepo after successful init', () => {
        const fn = async () => {
            const storageSubsys = new StorageSubsys();
            await storageSubsys.init(new StubMongoSubsys());
            return storageSubsys.videoRepo;
        };

        return expect(fn()).to.eventually.be.an('object');
    });
});
