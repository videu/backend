/**
 * @file Unit test for the AbstractSubsys class.
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

import { Videu } from '../../src/core/videu';
import { InvalidConfigError } from '../../src/error/invalid-config-error';

import { StubExtAbstractSubsys, StubExtAbstractSubsysFromEnv } from '../dummy/core/subsys';

describe('core/abstract-subsys:AbstractSubsys', () => {
    let dummy: StubExtAbstractSubsys;

    it('should instantiate normally', () => {
        const id = 'normal';
        dummy = new StubExtAbstractSubsys(id, []);
        expect(dummy.config).to.deep.eq(StubExtAbstractSubsys.CONFIG);
        expect(dummy.isInitialized).to.eq(false);
        expect(dummy.id).to.eq(id);
        expect(dummy.getApp()).to.eq(null);
    });

    it('should instantiate normally with config from env', () => {
        const id = 'config-from-env';
        dummy = new StubExtAbstractSubsysFromEnv(id, [], false, false, false, true);
        expect(dummy.config).to.deep.eq(StubExtAbstractSubsys.CONFIG);
        expect(dummy.isInitialized).to.eq(false);
        expect(dummy.id).to.eq(id);
        expect(dummy.getApp()).to.eq(null);
    });

    let videu: Videu;

    it('should initialize normally', () => {
        videu = new Videu([dummy]);
        const fn = async () => await videu.init();
        expect(videu.init()).to.eventually.become(undefined);
        expect(dummy.isInitialized).to.eq(true);
    });

    it('should de-initialize normally', () => {
        expect(videu.exit()).to.eq(undefined);
        expect(dummy.isInitialized).to.eq(false);
    });

    it('should throw an error with invalid ids', () => {
        const fn = () => new StubExtAbstractSubsys('INVALID_ID', []);
        return expect(fn).to.throw(Error);
    });

    it('should throw an error with invalid config object', () => {
        const fn = () => new StubExtAbstractSubsys('a', [], false, false, true);
        return expect(fn).to.throw(InvalidConfigError);
    });

    it('should throw an error with no config specified', () => {
        const fn = () => new StubExtAbstractSubsys('a', [], false, false, false, true);
        return expect(fn).to.throw(InvalidConfigError);
    });
});
