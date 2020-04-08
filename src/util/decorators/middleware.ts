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

import { FMWFactory, FMWFactoryConfigurator } from '../../../types/routes/middleware';
import {
    IRoute,
    RequestMethodName,
} from '../../../types/routes/route';

/**
 * Return value of the `@middleware` decorator factory,
 * i.e. the actual decorator.
 *
 * @param route The route class this is applied on.
 * @param method The request method name this is applied on.
 */
type FMiddlewareRet<M extends RequestMethodName> = (route: IRoute, method: M) => void;

/**
 * Decorator factory that adds a middleware handler factory to the request
 * handler's middleware factory chain it is applied to.
 *
 * @param M The request method name (determined automatically, don't set this
 *     explicitly).
 * @param factory The middleware factory.
 * @return The decorator that adds the middleware.
 */
export function middleware<M extends RequestMethodName>(factory: FMWFactory):
FMiddlewareRet<M>;

/**
 * Decorator factory that adds a configurable middleware handler to the request
 * handler's middleware factory chain it is applied to.
 *
 * @param M The request method name (determined automatically, don't set this
 *     explicitly).
 * @param O The middleware configuration type (determined automatically, don't
 *     set this explicitly).
 * @param factoryConfigurator The middleware factory configurator.
 * @param opts The middleware configuration options.
 * @return The decorator that adds the middleware.
 */
export function middleware<
    M extends RequestMethodName,
    O extends object
>(factoryConfigurator: FMWFactoryConfigurator<O>, opts: O): FMiddlewareRet<M>;

export function middleware<
    M extends RequestMethodName,
    O extends object
>(factory: FMWFactory | FMWFactoryConfigurator<O>, opts?: O): FMiddlewareRet<M> {
    return function(route: IRoute, method: M) {
        if (route.middleware === undefined) {
            route.middleware = {
                get: [],
                post: [],
                put: [],
                delete: [],
                patch: [],
            };
        }

        /*
         * Decorators get executed from bottom to top, so we need to insert
         * the middleware factory at the beginning of the chain
         * (hence the `unshift`)
         */
        if (opts === undefined) {
            /* TODO: See if there is any way to get tsc to figure this cast out on its own */
            route.middleware[method].unshift(factory as FMWFactory);
        } else  {
            route.middleware[method].unshift(
                (factory as FMWFactoryConfigurator<O>)(opts)
            );
        }
    };
}
