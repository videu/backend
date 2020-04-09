/**
 * Unit test for the AbstractSubsys and AbstractSubsysConfigurable classes.
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

import { LifecycleState } from '../../types/core/lifecycle';

import { IllegalAccessError } from '../../src/error/illegal-access-error';
import { IllegalStateError } from '../../src/error/illegal-state-error';

import { IStubSubsysConfig, StubSubsys, StubSubsysConfigurable } from '../dummy/core/subsys';

before(() => {
    if (typeof global.videu !== 'object') {
        (global.videu as any) = { logLevel: 0 };
    } else {
        global.videu.logLevel = 0;
    }
});

/** Test result data returned by a {@linkcode FStubSubsysTester} callback. */
interface IStubSubsysTestResult<InitParams extends any[] = []> {
    id: string;
    initParams: InitParams | null;
    state: LifecycleState;
}

/** Test callback function for testing the {@linkcode AbstractSubsys} class. */
type FStubSubsysTester<InitParams extends any[] = []> =
    () => Promise<IStubSubsysTestResult<InitParams>>;

describe('core/abstract-subsys:AbstractSubsys', () => {
    it('should have state CREATED after instantiation', () => {
        return expect(new StubSubsys<[]>('stub', false, false).state).to.eq(LifecycleState.CREATED);
    });

    it('should have state INITIALIZED after calling init()', () => {
        const fn = async () => {
            const dummy = new StubSubsys<[]>('stub', false, false);
            await dummy.init();
            return dummy.state;
        };
        return expect(fn()).to.eventually.eq(LifecycleState.INITIALIZED);
    });

    it('should have state EXITED after calling exit()', () => {
        const fn = async () => {
            const dummy = new StubSubsys<[]>('stub', false, false);
            await dummy.init();
            await dummy.exit();
            return dummy.state;
        };
        return expect(fn()).to.eventually.eq(LifecycleState.EXITED);
    });

    it('should throw the same error on init() as thrown by onInit()', () => {
        const fn = async () => {
            const dummy = new StubSubsys<[]>('failing', true, false);
            await dummy.init();
        };
        return expect(fn()).to.eventually.be.rejectedWith(Error, StubSubsys.INIT_ERROR_MESSAGE);
    });

    it('should enter ERROR state after onInit() throws an error', () => {
        const fn = async () => {
            const dummy = new StubSubsys<[]>('failing', true, false);
            try {
                await dummy.init();
            } catch (err) {
                return dummy.state;
            }

            return dummy.state;
        };
        return expect(fn()).to.eventually.eq(LifecycleState.ERROR);
    });

    it('should throw the same error on exit() as thrown by onExit()', () => {
        const fn = async () => {
            const dummy = new StubSubsys<[]>('failing', false, true);
            await dummy.init();
            await dummy.exit();
        };
        return expect(fn()).to.eventually.be.rejectedWith(Error, StubSubsys.EXIT_ERROR_MESSAGE);
    });

    it('should enter ERROR state after inExit() throws an error', () => {
        const fn = async () => {
            const dummy = new StubSubsys<[]>('failing', false, true);
            await dummy.init();
            try {
                await dummy.exit();
            } catch (err) {
                return dummy.state;
            }

            return dummy.state;
        };
        return expect(fn()).to.eventually.eq(LifecycleState.ERROR);
    });

    it('should refuse initializing twice', () => {
        const fn = async () => {
            const dummy = new StubSubsys<[]>('stub', false, false);
            await dummy.init();
            await dummy.init();
        };
        return expect(fn()).to.eventually.be.rejectedWith(IllegalStateError);
    });

    it('should refuse exiting twice', () => {
        const fn = async () => {
            const dummy = new StubSubsys<[]>('stub', false, false);
            await dummy.init();
            await dummy.exit();
            await dummy.exit();
        };
        return expect(fn()).to.eventually.be.rejectedWith(IllegalStateError);
    });

    it('should initialize normally without init params', () => {
        const fn: FStubSubsysTester<[]> = async () => {
            const dummy = new StubSubsys<[]>('stub', false, false);
            await dummy.init();
            return {
                id: dummy.id,
                initParams: dummy.initParams,
                state: dummy.state,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [],
            state: LifecycleState.INITIALIZED,
        }, 'Subsys state invalid');
    });

    it('should initialize normally with one init parameter', () => {
        const fn: FStubSubsysTester<[number]> = async () => {
            const dummy = new StubSubsys<[number]>('stub', false, false);
            await dummy.init(420);
            return {
                id: dummy.id,
                initParams: dummy.initParams,
                state: dummy.state,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [ 420 ],
            state: LifecycleState.INITIALIZED,
        }, 'Subsys state invalid');
    });

    it('should initialize normally with two init parameters', () => {
        const fn: FStubSubsysTester<[string, number]> = async () => {
            const dummy = new StubSubsys<[string, number]>('stub', false, false);
            await dummy.init('param', 420);
            return {
                id: dummy.id,
                initParams: dummy.initParams,
                state: dummy.state,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [ 'param', 420 ],
            state: LifecycleState.INITIALIZED,
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
                state: dummy.state,
            };
        };

        return expect(fn()).to.eventually.deep.eq({
            id: 'stub',
            initParams: [],
            state: LifecycleState.EXITED,
        }, 'Subsys state invalid');
    });

    it('should reject invalid subsystem id', () => {
        const fn = () => new StubSubsys<[]>('INVALID NAME', false, false);
        return expect(fn).to.throw(Error);
    });
});

/**
 * Return value of a {@linkcode FStubSubsysConfigurableTester} callback function
 * used in the individual test cases for {@linkcode AbstractSubsysConfigurable}.
 */
interface IStubSubsysConfigurableTestResult<InitParams extends any[] = []>
extends IStubSubsysTestResult<InitParams> {
    config: IStubSubsysConfig;
}

/** Callback for testing the {@linkcode AbstractSubsysConfigurable} class */
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
                state: dummy.state,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [],
            config: StubSubsysConfigurable.CONFIG,
            state: LifecycleState.INITIALIZED,
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
                state: dummy.state,
            };
        };

        return expect(fn()).to.eventually.deep.equal({
            id: 'stub',
            initParams: [],
            config: StubSubsysConfigurable.CONFIG,
            state: LifecycleState.INITIALIZED,
        }, 'Subsys state invalid');
    });

    it('should reject accessing the config before init', () => {
        const fn = () => {
            const dummy = new StubSubsysConfigurable<[]>('stub', false, false, false, true);
            return dummy.config;
        };

        return expect(fn).to.throw(IllegalAccessError);
    });
});
