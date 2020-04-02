/**
 * @file Unit test for the Videu class.
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

import { DummySubsys } from '../dummy/core/subsys';

interface IVideuTestCase {
    testDesc: string;
    subsystems: DummySubsys[];
}

/* mute error output */
before(() => {
    if (typeof global.videu !== 'object') {
        (global as any).videu = { logLevel: 0 };
    } else {
        (global.videu as any).logLevel = 0;
    }
});

const GOOD_CASES: IVideuTestCase[] = [
    {
        testDesc: 'should initialize with 0 subsystems',
        subsystems: [],
    },
    {
        testDesc: 'should initialize with 1 subsystem',
        subsystems: [new DummySubsys('normal', [], false, false)],
    },
    {
        testDesc: 'should initialize with 2 subsystems',
        subsystems: [
            new DummySubsys('normal1', [], false, false),
            new DummySubsys('normal2', [], false, false),
        ],
    },
    {
        testDesc: 'should initialize with one subsystem dependency',
        subsystems: [
            new DummySubsys('requester', ['dependant'], false, false),
            new DummySubsys('dependant', [], false, false),
        ],
    },
    {
        testDesc: 'should initialize with multiple subsystem dependencies',
        subsystems: [
            new DummySubsys('dep-a', ['dep-b'], false, false),
            new DummySubsys('requester', ['dep-a', 'dep-b'], false, false),
            new DummySubsys('dep-b', [], false, false),
        ],
    },
    {
        testDesc: 'should still de-initialize dependants if requester fails',
        subsystems: [
            new DummySubsys('good', [], false, false),
            new DummySubsys('fail-exit', ['good'], false, true),
        ],
    },
];

const BAD_CASES: IVideuTestCase[] = [
    {
        testDesc: 'should not initialize with dependency cycle',
        subsystems: [
            new DummySubsys('a', ['b'], false, false),
            new DummySubsys('b', ['a'], false, false),
        ],
    },
    {
        testDesc: 'should not initialize with complex dependency cycle',
        subsystems: [
            new DummySubsys('a', ['b'], false, false),
            new DummySubsys('b', ['c'], false, false),
            new DummySubsys('c', ['a'], false, false),
        ],
    },
    {
        testDesc: 'should not initialize with one failing subsystem',
        subsystems: [
            new DummySubsys('failing', [], true, false),
            new DummySubsys('not failing', ['failing'], false, false),
        ],
    },
    {
        testDesc: 'should not initialize with two subsystems having the same id',
        subsystems: [
            new DummySubsys('same-id', [], false, false),
            new DummySubsys('same-id', [], false, false),
        ],
    },
    {
        testDesc: 'should not initialize with unknown dependency',
        subsystems: [
            new DummySubsys('test', ['unknown'], false, false),
        ],
    },
];

/*
 * TODO: Find a better way to display a custom error message than making the
 *       executor retun it in case of an error and `null` if everything worked
 */

describe('core/videu:Videu', () => {
    for (const testCase of GOOD_CASES) {
        it(testCase.testDesc, () => {
            const executor = async () => {
                const instance: Videu = new Videu(testCase.subsystems);
                await instance.init();

                for (const subsys of testCase.subsystems) {
                    if (!subsys.isInitialized) {
                        return 'Subsystem was not initialized';
                    }
                    if (!subsys.hasDependenciesSatisfied) {
                        return 'Subsystem dependencies have not been satisfied';
                    }
                }

                if (!instance.isInitialized) {
                    return 'Instance is not initialized';
                }

                instance.exit();

                for (const subsys of testCase.subsystems) {
                    if (subsys.isInitialized) {
                        return 'Subsystem has not been de-initialized';
                    }
                    if (!subsys.hasDependenciesSatisfied) {
                        return 'Subsystem dependencies have been de-initialized before';
                    }
                }

                if (instance.isInitialized) {
                    return 'Instance was not de-initialized';
                }

                return null;
            };

            return expect(executor()).to.eventually.be.null;
        });
    }

    for (const testCase of BAD_CASES) {
        it(testCase.testDesc, () => {
            const executor = async () => {
                const instance: Videu = new Videu(testCase.subsystems);
                await instance.init();
                instance.exit();
            };

            return expect(executor()).to.eventually.be.rejected;
        });
    }

    it('should return null for unknown subsystems', () => {
        const instance = new Videu([]);
        return expect(instance.getSubsys('test')).to.be.null;
    });
});
