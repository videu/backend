/**
 * Unit test for the conversion utilities.
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

import { toBoolSafe, toIntSafe } from '../../src/util/conversions';

/* tslint:disable:no-construct */

describe('util/conversions:toBoolSafe', () => {
    /* booleans */
    it('should return "true" unchanged', () => {
        return expect(toBoolSafe(true)).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(true, 'Return value is not "true"');
    });
    it('should return "false" unchanged', () => {
        return expect(toBoolSafe(false)).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(false, 'Return value is not "false"');
    });

    /* strings */
    it('should convert the string "true"', () => {
        return expect(toBoolSafe('true')).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(true, 'Return value is not "true"');
    });
    it('should convert the string "false"', () => {
        return expect(toBoolSafe('false')).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(false, 'Return value is not "false"');
    });

    it('should convert the string "1"', () => {
        return expect(toBoolSafe('1')).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(true, 'Return value is not "true"');
    });
    it('should convert the string "0"', () => {
        return expect(toBoolSafe('0')).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(false, 'Return value is not "false"');
    });

    it('should not convert the string "2"', () => {
        return expect(toBoolSafe('2')).to.be.undefined;
    });
    it('should not convert the string "asdf"', () => {
        return expect(toBoolSafe('asdf')).to.be.undefined;
    });
    it('should not convert an empty string', () => {
        return expect(toBoolSafe('')).to.be.undefined;
    });

    /* numbers */
    it('should convert the number 1', () => {
        return expect(toBoolSafe(1)).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(true, 'Return value is not "true"');
    });
    it('should convert the number 0', () => {
        return expect(toBoolSafe(0)).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(false, 'Return value is not "false"');
    });

    it('should not convert the number 2', () => {
        return expect(toBoolSafe(2)).to.be.undefined;
    });
    it('should not convert the number -1', () => {
        return expect(toBoolSafe(-1)).to.be.undefined;
    });
    it('should not convert the number 0.5', () => {
        return expect(toBoolSafe(0.5)).to.be.undefined;
    });
    it('should not convert the number NaN', () => {
        return expect(toBoolSafe(NaN)).to.be.undefined;
    });
    it('should not convert the number Infinity', () => {
        return expect(toBoolSafe(Infinity)).to.be.undefined;
    });
    it('should not convert the number -Infinity', () => {
        return expect(toBoolSafe(-Infinity)).to.be.undefined;
    });

    /* Boolean objects */
    it('should convert a "true" Boolean object', () => {
        return expect(toBoolSafe(new Boolean(true))).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(true, 'Return value is not "true"');
    });
    it('should convert a "false" Boolean object', () => {
        return expect(toBoolSafe(new Boolean(false))).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(false, 'Return value is not "false"');
    });

    /* Number objects */
    it('should convert a "1" Number object', () => {
        return expect(toBoolSafe(new Number(1))).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(true, 'Return value is not "true"');
    });
    it('should convert a "0" Number object', () => {
        return expect(toBoolSafe(new Number(0))).to
            .be.a('boolean', 'Return value is not a boolean')
            .and.eq(false, 'Return value is not "false"');
    });

    it('should not convert a "2" Number object', () => {
        return expect(toBoolSafe(new Number(2))).to.be.undefined;
    });
    it('should not convert a "-1" Number object', () => {
        return expect(toBoolSafe(new Number(-1))).to.be.undefined;
    });
    it('should not convert a "0.5" Number object', () => {
        return expect(toBoolSafe(new Number(0.5))).to.be.undefined;
    });
    it('should not convert a "NaN" Number object', () => {
        return expect(toBoolSafe(new Number(NaN))).to.be.undefined;
    });
    it('should not convert a "Infinity" Number object', () => {
        return expect(toBoolSafe(new Number(Infinity))).to.be.undefined;
    });
    it('should not convert a "-Infinity" Number object', () => {
        return expect(toBoolSafe(new Number(-Infinity))).to.be.undefined;
    });

    /* arbitrary objects */
    it('should not convert an empty plain object', () => {
        return expect(toBoolSafe({})).to.be.undefined;
    });
    it('should not convert an empty array', () => {
        return expect(toBoolSafe([])).to.be.undefined;
    });
    it('should not convert a populated plain object', () => {
        return expect(toBoolSafe({test: 'yes'})).to.be.undefined;
    });
    it('should not convert a populated array', () => {
        return expect(toBoolSafe([true])).to.be.undefined;
    });

    /* functions */
    it('should not convert a function', () => {
        return expect(toBoolSafe(() => true)).to.be.undefined;
    });
    it('should not convert a constructor', () => {
        return expect(toBoolSafe(Object)).to.be.undefined;
    });

    /* others */
    it('should not convert "null"', () => {
        return expect(toBoolSafe(null)).to.be.undefined;
    });
    it('should not convert "undefined"', () => {
        return expect(toBoolSafe(undefined)).to.be.undefined;
    });
});

describe('util/conversions:toIntSafe', () => {
    /* numbers */
    it('should return the number "0" unchanged', () => {
        return expect(toIntSafe(0)).to
            .be.a('number', 'Return value is not a number')
            .and.eq(0, 'Return value is not "0"');
    });
    it('should return the number "-1" unchanged', () => {
        return expect(toIntSafe(-1)).to
            .be.a('number', 'Return value is not a number')
            .and.eq(-1, 'Return value is not "-1"');
    });
    it('should return the number "3.14" as an integer', () => {
        return expect(toIntSafe(3.14)).to
            .be.a('number', 'Return value is not a number')
            .and.eq(3, 'Return value is not "3"');
    });
    it('should not return the number "NaN"', () => {
        return expect(toIntSafe(NaN)).to.be.undefined;
    });
    it('should not return the number "Infinity"', () => {
        return expect(toIntSafe(Infinity)).to.be.undefined;
    });
    it('should not return the number "-Infinity"', () => {
        return expect(toIntSafe(-Infinity)).to.be.undefined;
    });

    /* strings */
    it('should convert the string "0"', () => {
        return expect(toIntSafe('0')).to
            .be.a('number', 'Return value is not a number')
            .and.eq(0, 'Return value is not "0"');
    });
    it('should convert the string "-1"', () => {
        return expect(toIntSafe('-1')).to
            .be.a('number', 'Return value is not a number')
            .and.eq(-1, 'Return value is not "-1"');
    });
    it('should convert the string "3.14" to "3"', () => {
        return expect(toIntSafe('3.14')).to
            .be.a('number', 'Return value is not a number')
            .and.eq(3, 'Return value is not "3"');
    });
    it('should not convert the string "NaN"', () => {
        return expect(toIntSafe('NaN')).to.be.undefined;
    });
    it('should not convert the string "Infinity"', () => {
        return expect(toIntSafe('Infinity')).to.be.undefined;
    });
    it('should not the string "123asdf"', () => {
        return expect(toIntSafe('123asdf')).to.be.undefined;
    });

    /* booleans */
    it('should convert "true" to "1"', () => {
        return expect(toIntSafe(true)).to
            .be.a('number', 'Return value is not a number')
            .and.eq(1, 'Return value is not "1"');
    });
    it('should convert "false" to "0"', () => {
        return expect(toIntSafe(false)).to
            .be.a('number', 'Return value is not a number')
            .and.eq(0, 'Return value is not "0"');
    });

    /* Number objects */
    it('should convert a "0" Number object', () => {
        return expect(toIntSafe(new Number(0))).to
            .be.a('number', 'Return value is not a number')
            .and.eq(0, 'Return value is not "0"');
    });
    it('should convert a "-1" Number object', () => {
        return expect(toIntSafe(new Number(-1))).to
            .be.a('number', 'Return value is not a number')
            .and.eq(-1, 'Return value is not "-1"');
    });
    it('should convert a "3.14" Number object to "3"', () => {
        return expect(toIntSafe(new Number(3.14))).to
            .be.a('number', 'Return value is not a number')
            .and.eq(3, 'Return value is not "3"');
    });
    it('should not return a "NaN" Number object', () => {
        return expect(toIntSafe(new Number(NaN))).to.be.undefined;
    });
    it('should not return a "Infinity" Number object', () => {
        return expect(toIntSafe(new Number(Infinity))).to.be.undefined;
    });
    it('should not return a "-Infinity" Number object', () => {
        return expect(toIntSafe(new Number(-Infinity))).to.be.undefined;
    });

    /* Boolean objects */
    it('should convert a "true" Boolean object to "1"', () => {
        return expect(toIntSafe(new Boolean(true))).to
            .be.a('number', 'Return value is not a number')
            .and.eq(1, 'Return value is not "1"');
    });
    it('should convert "false" Boolean object to "0"', () => {
        return expect(toIntSafe(new Boolean(false))).to
            .be.a('number', 'Return value is not a number')
            .and.eq(0, 'Return value is not "0"');
    });

    /* arbitrary objects */
    it('should not convert an empty object', () => {
        return expect(toIntSafe({})).to.be.undefined;
    });
    it('should not convert an empty array', () => {
        return expect(toIntSafe([])).to.be.undefined;
    });
    it('should not convert a populated object', () => {
        return expect(toIntSafe({test: 1})).to.be.undefined;
    });
    it('should not convert a populated array', () => {
        return expect(toIntSafe([1])).to.be.undefined;
    });

    /* functions */
    it('should not convert a function', () => {
        return expect(toIntSafe(() => 1)).to.be.undefined;
    });
    it('should not convert a constructor', () => {
        return expect(toIntSafe(Number)).to.be.undefined;
    });

    /* others */
    it('should not convert "null"', () => {
        return expect(toIntSafe(null)).to.be.undefined;
    });
    it('should not convert "undefined"', () => {
        return expect(toIntSafe(undefined)).to.be.undefined;
    });
});
