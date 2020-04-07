/**
 * @file Property injection decorator factory.
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

/**
 * Property decorator factory that directly injects a value into the property.
 * This is required because member decorators are the only way of instantiating
 * a property _before_ it is accessed by a member function decorator.
 * Properties having an injected value must have a type that may be undefined
 * and **MUST NEVER** assign a property on class instantiation, because that
 * would overwrite the value injected here.
 * This decorator basically only exists to instantiate the
 * {@link AbstractRoute#middleware} object, and it's probably best to not use
 * it for anything else.  One dubious hack should be quite enough.
 *
 * @param T The value type.  This should always be specified explicitly.
 * @param val The property value.
 * @return The decorator callback.
 */
export function injectValue<T extends any>(val: T) {
    return function(target: any, propertyKey: string) {
        target[propertyKey] = val;
    };
}
