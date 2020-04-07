/**
 * @file Middleware decorator factory.
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

import { FMWFactory } from '../../../types/routes/middleware';
import {
    IRoute,
    RequestMethodName,
} from '../../../types/routes/route';

/**
 * Decorator factory that adds a middleware handler factory to the request
 * handler's middleware factory chain it is applied to.
 *
 * @param M The request method name.
 * @param mwFactory The middleware factory.
 * @return The decorator callback.
 */
export function middleware<M extends RequestMethodName>(mwFactory: FMWFactory) {
    return function(route: IRoute, method: M) {
        if (typeof route.middleware === 'undefined') {
            throw new TypeError(
                'Middleware factory chains object is undefined '
                + '(forgot instantiation with @injectValue?)'
            );
        }

        /*
         * Decorators get executed from bottom to top, so we need to insert
         * the middleware factory at the beginning of the chain
         */
        route.middleware[method].unshift(mwFactory);
    };
}
