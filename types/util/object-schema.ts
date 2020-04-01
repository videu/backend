/**
 * @file Type definitions for object schema validation utilities.
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

import { SealedArray } from '../array';
import { PrimitiveName, PrimitiveNameOf } from '../primitives';

/**
 * A property definition for an arbitrary primitive type.
 */
export interface IPropSchema<T, V extends PrimitiveName = PrimitiveNameOf<T>> {
    /** The type name, as would be returned by a `typeof` statement. */
    readonly type: V;
    /**
     * The default value, if the value to validate is `undefined`.  If this is
     * left out, the value must be defined explicitly or validation will fail.
     */
    readonly default?: T;
}

/**
 * A string property definition.
 */
export interface IStringPropSchema extends IPropSchema<string> {
    /** An optional regular expression the strung must match. */
    readonly regex?: RegExp;
}

/**
 * A number property definition.
 */
export interface INumberPropSchema extends IPropSchema<number> {
    /** An optional range specification the number must be inside. */
    readonly range?: SealedArray<[number, number]>;
}

/**
 * An object property definition.
 */
export interface IObjectPropSchema extends IPropSchema<object> {
    /** The schema for this object. */
    readonly children: IObjectSchema;
}

/**
 * A schema definition for a single property inside an object.
 */
export type PropSchema =
    IStringPropSchema
    | INumberPropSchema
    | IObjectPropSchema
    | IPropSchema<boolean>;

/**
 * An object that describes the structure, properties and types / value ranges
 * for JSON objects. This is mainly used for validating request bodies.
 */
export interface IObjectSchema {
    [key: string]: PropSchema;
}
