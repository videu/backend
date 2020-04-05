/**
 * @file Unit test for the user repository.
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
import { ObjectId } from 'mongodb';

import { StubUserDataAuthority, StubUserDataCache } from '../dummy/data/data-source/user';
import { DUMMY_USERS } from '../dummy/data/user';
import { StubLogger } from '../dummy/util/logger';

import { UserRepository } from '../../src/data/repository/user-repository';
import { ConflictError } from '../../src/error/conflict-error';
import { User } from '../../src/model/user';

describe('data/repository/user-repository:UserRepoistory', () => {
    const userRepo = new UserRepository(new StubLogger(), new StubUserDataAuthority());
    const dummy = DUMMY_USERS[0];

    it('should retrieve a user by id w/out cache', () => {
        const fn = async () => ( await userRepo.getById(dummy._id) )!.id;
        return expect(fn()).to.eventually.equal(dummy.id);
    });
    it('should retrieve a user by email w/out cache', () => {
        const fn = async () => ( await userRepo.getByEmail(dummy.email) )!.id;
        return expect(fn()).to.eventually.equal(dummy.id);
    });
    it('should retrieve a user by user name w/out cache', () => {
        const fn = async () => ( await userRepo.getByUserName(dummy.uName) )!.id;
        return expect(fn()).to.eventually.equal(dummy.id);
    });

    let newId: ObjectId | null = null;

    it('should register a new user normally w/out cache', () => {
        const fn = async () => {
            const user = await userRepo.register({
                activationToken: 'activation_token',
                uName: 'Test',
                email: 'unit-test@test.net',
                passwd: 'not-hashed',
                settings: {
                    newsletter: true,
                    showPP: true,
                },
            });

            newId = user._id;

            return {
                activationToken: user.activationToken,
                dName: user.dName,
                email: user.email,
                lName: user.lName,
                passwd: user.passwd,
                /* tolerance of 1 second should be more than enough */
                joinedCorrect: Math.abs(Date.now() - user.joined.getTime()) < 1000,
                settings: {
                    newsletter: user.settings.newsletter,
                    showPP: user.settings.showPP,
                },
                subCount: user.subCount,
                uName: user.uName,
                v: user.v,
            };
        };

        return expect(fn()).to.eventually.deep.eq({
            activationToken: 'activation_token',
            dName: 'Test',
            email: 'unit-test@test.net',
            lName: 'test',
            passwd: 'not-hashed',
            joinedCorrect: true,
            settings: {
                newsletter: true,
                showPP: true,
            },
            subCount: 0,
            uName: 'Test',
            v: false,
        });
    });

    it('should return that new user w/out cache', () => {
        const fn = async () => await userRepo.getByUserName('Test');
        return expect(fn()).to.eventually.not.be.null;
    });

    it('should reject calling create()', () => {
        return expect(userRepo.create({
            uName: 'invalid',
            email: 'invalid@example.com',
            passwd: 'not-hashed',
        })).to.eventually.be.rejectedWith(Error);
    });

    it('should reject creating a user w/ existing user name', () => {
        return expect(userRepo.register({
            uName: dummy.uName,
            email: 'not-taken@example.com',
            passwd: 'not-hashed',
        })).to.eventually.be.rejectedWith(ConflictError);
    });

    it('should reject creating a user w/ existing email', () => {
        return expect(userRepo.register({
            uName: 'not_taken',
            email: dummy.email,
            passwd: 'not-hashed',
        })).to.eventually.be.rejectedWith(ConflictError);
    });

    const userCache = new StubUserDataCache();

    it('should put an existing user into cache', () => {
        userRepo.addCache(userCache);
        const fn = async () => {
            await userRepo.getById(dummy._id);
            return userCache.users.has(dummy.id);
        };
        return expect(fn()).to.eventually.be.true;
    });

    it('should retrieve a user in cache by id', () => {
        const id = new ObjectId();

        /*
         * This item is not present in the authority dada source, wo we know
         * we've hit the cache if the repo doesn't return null.
         */
        userCache.users.set(id.toHexString(), new User({
            _id: id,
            uName: 'cache',
            email: 'cache@unit.test',
        }));

        return expect(userRepo.getById(id)).to.eventually.not.be.null;
    });

    it('should retrieve a user in cache by email', () => {
        /* see test case above */
        return expect(userRepo.getByEmail('cache@unit.test')).to.eventually.not.be.null;
    });

    it('should retrieve a user in cache by user name', () => {
        /* see test case above */
        return expect(userRepo.getByUserName('cache')).to.eventually.not.be.null;
    });
});
