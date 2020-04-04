/**
 * @file Unit test for the AbstractSubsys and AbstractSubsysConfigurable classes.
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

import { IllegalAccessError } from '../../src/error/illegal-access-error';

import { IStubSubsysConfig, StubSubsys, StubSubsysConfigurable } from '../dummy/core/subsys';

before(() => {
    if (typeof global.videu !== 'object') {
        (global.videu as any) = { logLevel: 0 };
    } else {
        global.videu.logLevel = 0;
    }
});

/** Test result data returned by a {@link FStubSubsysTester} callback. */
interface IStubSubsysTestResult<InitParams extends any[] = []> {
    id: string;
    initParams: InitParams | null;
    isInitialized: boolean;
}

/** Test callback function for testing the {@link AbstractSubsys} class. */
type FStubSubsysTester<InitParams extends any[] = []> =
    () => Promise<IStubSubsysTestResult<InitParams>>;

describe('core/abstract-subsys:AbstractSubsys', () => {
    it('should initialize normally without init params', () => {
        const fn: FStubSubsysTester<[]> = async () => {
            const dummy = new StubSubsys<[]>('stub', false, false);
            await dummy.init();
            return {
                id: dummy.id,
                initParams: dummy.initParams,
                isInitialized: dummy.isInitialized,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [],
            isInitialized: true,
        }, 'Subsys state invalid');
    });

    it('should initialize normally with one init parameter', () => {
        const fn: FStubSubsysTester<[number]> = async () => {
            const dummy = new StubSubsys<[number]>('stub', false, false);
            await dummy.init(420);
            return {
                id: dummy.id,
                initParams: dummy.initParams,
                isInitialized: dummy.isInitialized,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [ 420 ],
            isInitialized: true,
        }, 'Subsys state invalid');
    });

    it('should initialize normally with two init parameters', () => {
        const fn: FStubSubsysTester<[string, number]> = async () => {
            const dummy = new StubSubsys<[string, number]>('stub', false, false);
            await dummy.init('param', 420);
            return {
                id: dummy.id,
                initParams: dummy.initParams,
                isInitialized: dummy.isInitialized,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [ 'param', 420 ],
            isInitialized: true,
        }, 'Subsys state invalid');
    });

    it('should de-initialize normally', () => {
        const fn: FStubSubsysTester<[]> = async () => {
            const dummy = new StubSubsys<[]>('stub', false, false);
            await dummy.init();
            await dummy.exit();
            return {
                id: dummy.id,
                initParams: dummy.initParams,
                isInitialized: dummy.isInitialized,
            };
        };

        return expect(fn()).to.eventually.deep.eq({
            id: 'stub',
            initParams: [],
            isInitialized: false,
        }, 'Subsys state invalid');
    });

    it('should reject invalid subsystem id', () => {
        const fn = () => new StubSubsys<[]>('INVALID NAME', false, false);
        return expect(fn).to.throw(Error);
    });
});

/**
 * Return value of a {@link FStubSubsysConfigurableTester} callback function
 * used in the individual test cases for {@link AbstractSubsysConfigurable}.
 */
interface IStubSubsysConfigurableTestResult<InitParams extends any[] = []>
extends IStubSubsysTestResult<InitParams> {
    config: IStubSubsysConfig;
}

/** Test callback for testing the {@link AbstractSubsysConfigurable} class */
type FStubSubsysConfigurableTester<InitParams extends any[] = []> =
    () => Promise<IStubSubsysConfigurableTestResult<InitParams>>;

describe('core/abstract-subsys:AbstractSubsysConfigurable', () => {
    it('should initialize with config from constructor', () => {
        const fn: FStubSubsysConfigurableTester<[]> = async () => {
            const dummy = new StubSubsysConfigurable<[]>('stub');
            await dummy.init();
            return {
                id: dummy.id,
                initParams: dummy.initParams,
                config: dummy.config,
                isInitialized: dummy.isInitialized,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [],
            config: StubSubsysConfigurable.CONFIG,
            isInitialized: true,
        }, 'Subsys state invalid');
    });

    it('should initialize with config from env', () => {
        const fn: FStubSubsysConfigurableTester<[]> = async () => {
            const dummy = new StubSubsysConfigurable<[]>('stub', false, false, false, true);
            await dummy.init();
            return {
                id: dummy.id,
                initParams: dummy.initParams,
                config: dummy.config,
                isInitialized: dummy.isInitialized,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [],
            config: StubSubsysConfigurable.CONFIG,
            isInitialized: true,
        }, 'Subsys state invalid');
    });

    it('should throw an error with no config', () => {
        const fn = async () => {
            const dummy = new StubSubsysConfigurable<[]>('stub', false, false, false, false, true);
            await dummy.init();
        };

        return expect(fn()).to.be.rejectedWith(Error);
    });

    it('should reject accessing the config before init', () => {
        const fn = () => {
            const dummy = new StubSubsysConfigurable<[]>('stub');
            return dummy.config;
        };

        return expect(fn).to.throw(IllegalAccessError);
    });
});
