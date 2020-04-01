/**
 * @file Object schema validation.
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

import {
    INumberPropSchema,
    IObjectPropSchema,
    IObjectSchema,
    IStringPropSchema,
    PropSchema,
} from '../../types/util/object-schema';
import { InvalidConfigError } from '../error/invalid-config-error';

/**
 * Validate a single element of type object.
 * The {@link validateObject} function is called for every child.
 *
 * @param val The object to validate.
 * @param schema The schema to validate against.
 * @param propChain The current position in the property chain.
 */
function validateObjectSingle(val: any, schema: IObjectPropSchema, propChain: string[]): any {
    if (val === null) {
        throw new TypeError(`Invalid property "${propChain.join('.')}": Value is null`);
    }

    for (const key in schema.children) {
        if (!schema.children.hasOwnProperty(key)) {
            continue;
        }

        const childPropChain = [ ...propChain, key ];

        val[key] = validate(val[key], schema.children[key], childPropChain);
    }

    return val;
}

/**
 * Validate a single number.
 *
 * @param val The value.
 * @param schema The schema to validate against.
 * @param propChain The full property chain.
 */
function validateNumberSingle(val: number, schema: INumberPropSchema, propChain: string[]): number {
    if (Number.isNaN(val)) {
        throw new TypeError(
            `Invalid property "${propChain.join('.')}": Number is NaN`
        );
    }

    if (Array.isArray(schema.range)) {
        if (val < schema.range[0] || val > schema.range[1]) {
            throw new TypeError(
                `Invalid property "${propChain.join('.')}": `
                + `Number is out of specified range ${schema.range}`
            );
        }
    }

    return val;
}

/**
 * Validate a single string.
 *
 * @param val The value.
 * @param schema The schema to validate against.
 * @param propChain The full property chain.
 */
function validateStringSingle(val: string, schema: IStringPropSchema, propChain: string[]): string {
    if (schema.regex && !schema.regex.test(val)) {
        throw new TypeError(
            `Invalid property "${propChain.join('.')}": `
            + `String does not match ${schema.regex.toString()}`
        );
    }

    return val;
}

/**
 * Validate a single value against the specified schema.
 * This is a fairly low-level API, you should use the {@link validateConfig}
 * function for configuration validation instead.
 *
 * @param val The value.
 * @param schema The property definition of what the value _should_ be.
 * @param propChain The current chain in the property list, relative to the root
 *     object.  Required for specifying the exact variable that failed the spec.
 */
export function validate(val: any, schema: PropSchema, propChain: string[] = []): any {
    if (typeof val === 'undefined') {
        if (typeof schema.default === 'undefined') {
            throw new TypeError(
                `Property "${propChain.join('.')}" (type ${schema.type}) is `
                + 'missing and has no default value'
            );
        } else {
            return schema.default;
        }
    }

    if (typeof val !== schema.type) {
        throw new TypeError(
            `Invalid property "${propChain.join('.')}": `
            + `Expected "${schema.type}", but got "${typeof val}" instead`
        );
    }

    switch (schema.type) {
        case 'boolean':
            return val;
        case 'number':
            return validateNumberSingle(val, schema, propChain);
        case 'string':
            return validateStringSingle(val, schema, propChain);
        case 'object':
            return validateObjectSingle(val, schema, propChain);
    }
}

/**
 * Validate a configuration object against its schema specification.
 *
 * @param config The configuration object.
 * @param schema The schema describing what the configuration should look like.
 */
export function validateConfig<T extends object>(config: T, schema: IObjectSchema): T {
    if (typeof config !== 'object') {
        throw new InvalidConfigError(
            `Expected config to be an object, got "${typeof config}" instead`
        );
    }

    if (config === null) {
        throw new InvalidConfigError(
            'Expected config to be an object, got "null" instead'
        );
    }

    for (const key in schema) {
        if (!schema.hasOwnProperty(key)) {
            continue;
        }

        try {
            (config as any)[key] = validate((config as any)[key], schema[key], [ key ]);
        } catch (err) {
            throw new InvalidConfigError(err.message);
        }
    }

    return config;
}
