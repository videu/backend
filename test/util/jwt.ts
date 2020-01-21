/**
 * @file Unit test for the JWT issuing and verification API.
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

import { DUMMY_USERS } from '../dummy/data/user';

import { jwtSign, jwtVerify } from '../../src/util/jwt';
import { jwtRegex } from '../../src/util/regex';

chai.use(chaiAsPromised);

describe('util/jwt:jwtSign', () => {
    it('should sign a regular user id', () => {
        return expect(jwtSign(DUMMY_USERS[0])).to.eventually
            .be.a('string', 'Return value is not a string')
            .and.match(jwtRegex, 'Token does not match the JWT regular expression');
    });
});

describe('util/jwt:jwtVerify', () => {
    it('should verify a valid JSON web token', async () => {
        const token: string = await jwtSign(DUMMY_USERS[0]);

        return expect(jwtVerify(token)).to.eventually
            .be.an('object', 'Return value is not an object')
            .and.haveOwnProperty('id').eq(DUMMY_USERS[0].id);
    });
});
