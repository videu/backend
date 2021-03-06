/**
 * Type definitions for middleware factories.
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

import { IAuthSubsys } from '../core/auth-subsys';
import { IStorageSubsys } from '../core/storage-subsys';
import { ILogger } from '../logger';
import { IRequestHandler } from './route';

/**
 * A middleware handler factory.
 * This gets called by the {@linkcode AbstractRoute.init} method to construct
 * the actual middleware handler that is passed to express.  These factories
 * should only be passed to the {@linkcode middleware} decorator and never
 * called directly by a route endpoint.
 *
 * @param logger The logger.
 * @param authSubsys The auth subsystem.
 * @param storageSubsys The storage subsystem.
 * @returns The middleware request handler (compatible to the RequestHandler
 *     type from express).
 */
export type FMWFactory =
    (logger: ILogger, authSubsys: IAuthSubsys, storageSubsys: IStorageSubsys) => IRequestHandler;

/**
 * A "factory for middleware factories" where configuration parameters can be
 * passed in.  The return value of this function (i.e. the actual factory)
 * should be passed as the parameter for the {@linkcode middleware} decorator.
 *
 * @param opts The configuration options.
 * @typeParam T The type of the configuration parameters.
 * @returns The middleware factories w/ configuration parameters baked in.
 */
export type FMWFactoryConfigurator<T extends object> = (opts: T) => FMWFactory;
