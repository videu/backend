/**
 * @file Unit test for the object schema validation utility.
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

import { IObjectSchema } from '../../types/util/object-schema';

import { InvalidConfigError } from '../../src/error/invalid-config-error';
import { validateConfig } from '../../src/util/validate';

interface IObjectSchemaTestData {
    readonly positives: ITestConfig[];
    readonly negatives: any[];
}

interface ITestConfig {
    stringNoRegexNoDefault: string;
    stringWithRegexNoDefault: string;
    stringNoRegexWithDefault?: string;
    stringWithRegexWithDefault?: string;
    numberNoRangeNoDefault: number;
    numberWithRangeNoDefault: number;
    numberNoRangeWithDefault?: number;
    numberWithRangeWithDefault?: number;
    booleanNoDefault: boolean;
    booleanWithDefault?: boolean;
    objectNoDefault: {
        stringChildWithDefault?: string;
        booleanChild?: boolean;
        objectChildNoDefault: {
            inception: string;
        };
        objectChildWithDefault?: {
            defaultBool?: boolean;
        };
    };
    objectWithDefault?: {
        stringChild?: string;
        booleanChild?: boolean;
        objectChildNoDefault?: {
            inception: string;
        };
        objectChildWithDefault?: {
            defaultBool?: boolean;
        };
    };
}

const VALID_CONFIG: ITestConfig = {
    stringNoRegexNoDefault: 'string-no-regex-no-default',
    stringWithRegexNoDefault: 'string-with-regex-no-default',
    stringNoRegexWithDefault: 'string-no-regex-with-default',
    stringWithRegexWithDefault: 'string-with-regex-with-default',
    numberNoRangeNoDefault: 0,
    numberWithRangeNoDefault: 0,
    numberNoRangeWithDefault: 42,
    numberWithRangeWithDefault: 420,
    booleanNoDefault: false,
    booleanWithDefault: true,
    objectNoDefault: {
        stringChildWithDefault: 'string-child-with-default',
        booleanChild: false,
        objectChildNoDefault: {
            inception: 'inception-value',
        },
        objectChildWithDefault: {
            defaultBool: false,
        },
    },
    objectWithDefault: {
        stringChild: 'string-child',
        booleanChild: false,
        objectChildNoDefault: {
            inception: 'inception-value',
        },
        objectChildWithDefault: {
            defaultBool: false,
        },
    },
};

const MINIMAL_CONFIG: ITestConfig = {
    stringNoRegexNoDefault: 'string-no-regex-no-default',
    stringWithRegexNoDefault: 'string-with-regex-no-default',
    numberNoRangeNoDefault: 0,
    numberWithRangeNoDefault: 0,
    booleanNoDefault: false,
    objectNoDefault: {
        objectChildNoDefault: {
            inception: 'inception-value',
        },
    },
};

const TEST_SCHEMA: IObjectSchema = {
    stringNoRegexNoDefault: {
        type: 'string',
    },
    stringWithRegexNoDefault: {
        type: 'string',
        regex: /^string\-with\-regex\-no\-default$/,
    },
    stringNoRegexWithDefault: {
        type: 'string',
        default: 'string-no-regex-with-default',
    },
    stringWithRegexWithDefault: {
        type: 'string',
        regex: /^string\-with\-regex\-with\-default$/,
        default: 'string-with-regex-with-default',
    },
    numberNoRangeNoDefault: {
        type: 'number',
    },
    numberWithRangeNoDefault: {
        type: 'number',
        range: [ -10, 10 ],
    },
    numberNoRangeWithDefault: {
        type: 'number',
        default: 42,
    },
    numberWithRangeWithDefault: {
        type: 'number',
        default: 420,
        range: [ -1000, 1000 ],
    },
    booleanNoDefault: {
        type: 'boolean',
    },
    booleanWithDefault: {
        type: 'boolean',
        default: true,
    },
    objectNoDefault: {
        type: 'object',
        children: {
            stringChildWithDefault: {
                type: 'string',
                default: 'string-child-with-default',
                regex: /^string\-child\-with\-default$/,
            },
            booleanChild: {
                type: 'boolean',
                default: false,
            },
            objectChildNoDefault: {
                type: 'object',
                children: {
                    inception: {
                        type: 'string',
                    },
                },
            },
            objectChildWithDefault: {
                type: 'object',
                children: {
                    defaultBool: {
                        type: 'boolean',
                    },
                },
                default: {
                    defaultBool: false,
                },
            },
        },
    },
    objectWithDefault: {
        type: 'object',
        children: {
            stringChild: {
                type: 'string',
                default: 'string-child',
                regex: /^string\-child$/,
            },
            booleanChild: {
                type: 'boolean',
                default: false,
            },
            objectChildNoDefault: {
                type: 'object',
                children: {
                    inception: {
                        type: 'string',
                    },
                },
            },
            objectChildWithDefault: {
                type: 'object',
                children: {
                    defaultBool: {
                        type: 'boolean',
                    },
                },
                default: {
                    defaultBool: false,
                },
            },
        },
        default: {
            stringChild: 'string-child',
            booleanChild: false,
            objectChildNoDefault: {
                inception: 'inception-value',
            },
            objectChildWithDefault: {
                defaultBool: false,
            },
        },
    },
};

const CONFIG_TEST_DATA: IObjectSchemaTestData = {
    positives: [
        VALID_CONFIG,
        MINIMAL_CONFIG,
    ],
    /* TODO: Just deep copy the valid config and change one value per test case ffs */
    negatives: [
        'this is not a config',
        null,
        {},
        {
            stringNoRegexNoDefault: 'string-no-regex-no-default',
            stringWithRegexNoDefault: 'string-with-regex-no-default',
            numberNoRangeNoDefault: 0,
            numberWithRangeNoDefault: 0,
            booleanNoDefault: false,
            objectNoDefault: {
                objectChildNoDefault: {
                    inception: 'inception-value',
                },
            },
            objectWithDefault: null, /* is null */
        },
        {
            stringNoRegexNoDefault: 'string-no-regex-no-default',
            stringWithRegexNoDefault: 'string-with-regex-no-default',
            numberNoRangeNoDefault: 0 / 0, /* NaN */
            numberWithRangeNoDefault: 0,
            booleanNoDefault: false,
            objectNoDefault: {
                objectChildNoDefault: {
                    inception: 'inception-value',
                },
            },
        },
        {
            stringNoRegexNoDefault: 'string-no-regex-no-default',
            stringWithRegexNoDefault: 'string-with-regex-no-default',
            numberNoRangeNoDefault: 0,
            numberWithRangeNoDefault: 10000, /* out of range */
            booleanNoDefault: false,
            objectNoDefault: {
                objectChildNoDefault: {
                    inception: 'inception-value',
                },
            },
        },
        {
            stringNoRegexNoDefault: 'string-no-regex-no-default',
            stringWithRegexNoDefault: 'string-with-regex-not-matching', /* no regex match */
            numberNoRangeNoDefault: 0,
            numberWithRangeNoDefault: 0,
            booleanNoDefault: false,
            objectNoDefault: {
                objectChildNoDefault: {
                    inception: 'inception-value',
                },
            },
        },
        {
            stringNoRegexNoDefault: 'string-no-regex-no-default',
            stringWithRegexNoDefault: 'string-with-regex-no-default',
            numberNoRangeNoDefault: 'invalid-type', /* invalid type */
            numberWithRangeNoDefault: 0,
            booleanNoDefault: false,
            objectNoDefault: {
                objectChildNoDefault: {
                    inception: 'inception-value',
                },
            },
        },
    ],
};

describe('util/validate:validateConfig', () => {
    let i = 0;

    for (const obj of CONFIG_TEST_DATA.positives) {
        it(`should validate object #${i}`, () => {
            return expect(validateConfig(obj, TEST_SCHEMA)).to.deep.equal(VALID_CONFIG);
        });
        i++;
    }

    for (const obj of CONFIG_TEST_DATA.negatives) {
        it(`should not validate object #${i}"`, () => {
            return expect(() => validateConfig(obj, TEST_SCHEMA)).to.throw(InvalidConfigError);
        });
        i++;
    }
});
