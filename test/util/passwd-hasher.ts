/**
 * Unit test for the password hashing API.
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
import { describe } from 'mocha';

import { passwdHash, passwdVerify } from '../../src/util/passwd-hasher';

chai.use(chaiAsPromised);

const HASH_ROUNDS: number = 8;

const regularPasswd: string = 'aRegularPassword123';
const tooShortPasswd: string = '<8chars';
/* 70 chars, 74 bytes */
const tooLongPasswd: string =
    'ThisIsAReallyLongPasswordThatShouldGetRejectedBecauseItIsNotUnique😂😂';
const nullCharPasswd: string = 'pass\0word123';
const unicodePasswd: string = 'hipsterPassword😂';

const hashRegex: RegExp = new RegExp(
    `^\\$2b\\$${HASH_ROUNDS >= 10 ? HASH_ROUNDS : '0' + HASH_ROUNDS}\\$[a-zA-Z0-9\\.\\/]{53}$`
);

describe('util/passwd-hasher:passwdHash', () => {
    it('should hash a regular password', () => {
        return expect(passwdHash(regularPasswd, HASH_ROUNDS)).to.eventually
            .be.a('string', 'Return type is not a string')
            .and.match(hashRegex, 'Returned string is not a valid bcrypt hash');
    });

    it('should hash a password containing Unicode characters', () => {
        return expect(passwdHash(unicodePasswd, HASH_ROUNDS)).to.eventually
            .be.a('string', 'Return type is not a string')
            .and.match(hashRegex, 'Returned string is not a valid bcrypt hash');
    });

    it('should not hash a password that is less than 8 characters long', () => {
        return expect(passwdHash(tooShortPasswd, HASH_ROUNDS)).to.eventually
            .be.rejectedWith('Password must be at least 8 characters long')
            .and.be.an.instanceOf(RangeError);
    });

    it('should not hash a password with less than 6 rounds', () => {
        return expect(passwdHash(regularPasswd, 4)).to.eventually
            .be.rejectedWith('At least 6 hashing rounds are required')
            .and.be.an.instanceOf(RangeError);
    });

    // The bcrypt package does not check for ASCII NUL characters right now,
    // see <https://github.com/kelektiv/node.bcrypt.js/issues/774>
    it('should not hash a password containing NUL characters', () => {
        return expect(passwdHash(nullCharPasswd, HASH_ROUNDS)).to.eventually
            .be.rejectedWith('Password must not contain NUL characters')
            .and.be.an.instanceOf(RangeError);
    });
    it('should not hash a password exceeding 72 bytes', () => {
        return expect(passwdHash(tooLongPasswd, HASH_ROUNDS)).to.eventually
            .be.rejectedWith('Password must be at most 72 bytes in size')
            .and.be.an.instanceOf(RangeError);
    });
});

describe('util/passwd-hasher:passwdVerify', () => {
    it('should verify a correct password', async () => {
        const hash = await passwdHash(regularPasswd, HASH_ROUNDS);
        return expect(passwdVerify(regularPasswd, hash)).to.eventually
            .be.a('boolean', 'Return type is not a boolean')
            .and.eq(true);
    });

    it('should verify a correct password containing Unicode characters', async () => {
        const hash = await passwdHash(unicodePasswd, HASH_ROUNDS);
        return expect(passwdVerify(unicodePasswd, hash)).to.eventually
            .be.a('boolean', 'Return type is not a boolean')
            .and.eq(true);
    });

    it('should reject an incorrect password', async () => {
        const hash = await passwdHash(regularPasswd, HASH_ROUNDS);
        return expect(passwdVerify(regularPasswd + 'a', hash)).to.eventually
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(false);
    });

    it('should reject an incorrect password containing Unicode characters', async () => {
        const hash = await passwdHash(unicodePasswd, HASH_ROUNDS);
        return expect(passwdVerify(unicodePasswd + 'a', hash)).to.eventually
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(false);
    });
});
