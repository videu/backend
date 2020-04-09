/**
 * Unit test for the regex collection.
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
import { describe } from 'mocha';

import { decNumberRegex, emailRegex, hexNumberRegex, userNameRegex } from '../../src/util/regex';

interface IRegexTestData {
    readonly positives: string[];
    readonly negatives: string[];
}

const EMAIL_REGEX_DATA: IRegexTestData = {
    positives: [
        'someone@example.com',
        'some@one.co',
        'as.df@gmail.com',
        'test@[1.1.1.1]',
        'legalize@420blaze.it',
        'test_with-dashed+plus@example.com',
    ],
    negatives: [
        '',
        'me@example',
        '@test.net',
        ' @test.net',
        'asdf@    .net',
        'test@example.c',
        '......@test.net',
        'test@a.b',
    ],
};

const USER_NAME_REGEX_DATA: IRegexTestData = {
    positives: [
        'ab',
        'asdf',
        'asdf69',
        'as_df69',
        '__as_df__',
        'xXas_dfXx',
        'X1234_',
        'abcdefghijklmnop',
        'a1b2c3d4e5f6g7h8',
        '__',
        '________________',
        '1234657890',
    ],
    negatives: [
        '',
        'as-df',
        'as df',
        'a',
        ' ',
        '@test',
        'äsdf',
    ],
};

const DEC_NUMBER_REGEX_DATA: IRegexTestData = {
    positives: [
        '0',
        '123',
        '420',
        '-1',
        '-1000',
        '1.0',
        '1.1',
        '12345.54321',
        '1.00001',
        '-1.123',
        '-1.0',
        '-0.1',
        '3e3',
        '0e1',
        '0e0',
        '1e+3',
        '-1e8',
        '-1e-3',
    ],
    negatives: [
        '',
        ' 123',
        '123 ',
        '1 23',
        '1.1.1',
        '1.',
        '-0',
        '+0',
        '0.',
        'a1234',
        '1e',
        '1e4.5',
        '-0.0',
    ],
};

const HEX_NUMBER_REGEX_DATA: IRegexTestData = {
    positives: [
        '0xdeadbeef',
        '0x0',
        '0x25',
        '0x1234567890abcdef',
        '0xAa',
        '0x123',
    ],
    negatives: [
        '',
        '123',
        '0x',
        '0X12',
        '00x0',
        '0xabcdefg',
        '-0x11',
    ],
};

describe('util/regex:emailRegex', () => {
    for (const str of EMAIL_REGEX_DATA.positives) {
        it(`should match the string "${str}"`, () => {
            return expect(emailRegex.test(str)).to.eq(true);
        });
    }
    for (const str of EMAIL_REGEX_DATA.negatives) {
        it(`should not match the string "${str}"`, () => {
            return expect(emailRegex.test(str)).to.eq(false);
        });
    }
});

describe('util/regex:userNameRegex', () => {
    for (const str of USER_NAME_REGEX_DATA.positives) {
        it(`should match the string "${str}"`, () => {
            return expect(userNameRegex.test(str)).to.eq(true);
        });
    }
    for (const str of USER_NAME_REGEX_DATA.negatives) {
        it(`should not match the string "${str}"`, () => {
            return expect(userNameRegex.test(str)).to.eq(false);
        });
    }
});

describe('util/regex:decNumberRegex', () => {
    for (const str of DEC_NUMBER_REGEX_DATA.positives) {
        it(`should match the string "${str}"`, () => {
            return expect(decNumberRegex.test(str)).to.eq(true);
        });
    }
    for (const str of DEC_NUMBER_REGEX_DATA.negatives) {
        it(`should not match the string "${str}"`, () => {
            return expect(decNumberRegex.test(str)).to.eq(false);
        });
    }
});

describe('util/regex:hexNumberRegex', () => {
    for (const str of HEX_NUMBER_REGEX_DATA.positives) {
        it(`should match the string "${str}"`, () => {
            return expect(hexNumberRegex.test(str)).to.eq(true);
        });
    }
    for (const str of HEX_NUMBER_REGEX_DATA.negatives) {
        it(`should not match the string "${str}"`, () => {
            return expect(hexNumberRegex.test(str)).to.eq(false);
        });
    }
});
