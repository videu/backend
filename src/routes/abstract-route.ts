/**
 * @file General Router implementation.
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

import { Router as ExpressRouter } from 'express';

import { IAuthSubsys } from '../../types/core/auth-subsys';
import { LifecycleState } from '../../types/core/lifecycle';
import { IStorageSubsys } from '../../types/core/storage-subsys';
import { HTTPStatusCode } from '../../types/json/response';
import { ILogger } from '../../types/logger';
import { FMWFactory } from '../../types/routes/middleware';
import {
    IMiddlewareFactories,
    IRequest,
    IRequestHandler,
    IResponse,
    IRoute,
    RequestMethodName,
} from '../../types/routes/route';

import { IllegalStateError } from '../error/illegal-state-error';
import { RouteLogger } from '../util/logger';

/** An array of all supported HTTP request methods. */
export const REQUEST_METHODS: RequestMethodName[] = [
    'get',
    'post',
    'put',
    'delete',
    'patch',
];

/**
 * Abstract base class for all routes.
 */
export class AbstractRoute implements IRoute {

    /** @inheritdoc */
    public readonly name: string;

    /** @inheritdoc */
    public readonly children: Map<string, IRoute> = new Map();

    /** The express router instance. */
    public readonly router: ExpressRouter;

    /**
     * The entire middleware chain (and the final request handler itself) for
     * each request method (the request method name acts as the key) with the
     * actual request handler at the end of the array.
     *
     * Middleware handlers should never be added manually here, the
     * `@middleware` decorator is responsible for this (as well as instantiating
     * this field in the first place)
     *
     * @see {@link ../../src/util/decorator/middleware}
     */
    public readonly middleware?: IMiddlewareFactories;

    /** The logger for this route. */
    protected readonly logger: ILogger;

    /** The auth subsystem. */
    protected readonly authSubsys: IAuthSubsys;

    /**
     * The storage subsystem.
     * Children should store the individual repositories they need in a
     * dedicated private field to mitigate performance issues.
     */
    protected readonly storageSubsys: IStorageSubsys;

    /** Internal field for {@link #state} w/ write access. */
    private _state: LifecycleState = LifecycleState.CREATED;

    /**
     * Create a new Route.
     *
     * @param name The name of the path segment.
     * @param storageSubsys The storage subsystem.
     */
    constructor(name: string, authSubsys: IAuthSubsys, storageSubsys: IStorageSubsys) {
        this.name = name;
        this.authSubsys = authSubsys;
        this.storageSubsys = storageSubsys;

        this.router = ExpressRouter();
        this.logger = new RouteLogger(name);
    }

    /** @inheritdoc */
    public async init(): Promise<void> {
        if (this.state !== LifecycleState.CREATED) {
            throw new IllegalStateError(
                'Cannot initialize a route that is not in "created" state'
            );
        }

        for (const child of this.children.values()) {
            await child.init();
            if (child instanceof AbstractRoute) {
                this.router.use(`/${child.name}`, child.router);
            }
        }

        /*
         * TODO: This design is neat for error handling, but it also means that
         *       V8 needs to perform lookups in the prototype chain for every
         *       request in order to get the request handler.  I should find out
         *       how much performance this costs.
         */

        /*
         * Follow-up on that matter:
         * Based on some internal testing with random accesses on inherited
         * functions, it _appears_ that V8 has become quite good at inlining
         * (and/or doing some other prototype optimization magic, I really am
         * not that familiar with the engine's guts).  Note, however, that this
         * was just some bare-bone testing and you definitely shouldn't quote
         * me on that.  At the end of the day, speed really doesn't matter until
         * FreeTube has gained a critical mass of users that cause enough load
         * to even tickle the CPU.  So let's just say I will "fix that later"™.
         */

        this.router.get('/', ...this.mw('get'), async (req, res, next) => {
            try {
                await this.get(req, res);
            } catch (err) {
                next(err);
            }
        });
        this.router.post('/', ...this.mw('post'), async (req, res, next) => {
            try {
                await this.post(req, res);
            } catch (err) {
                next(err);
            }
        });
        this.router.put('/', ...this.mw('put'), async (req, res, next) => {
            try {
                await this.put(req, res);
            } catch (err) {
                next(err);
            }
        });
        this.router.delete('/', ...this.mw('delete'), async (req, res, next) => {
            try {
                await this.delete(req, res);
            } catch (err) {
                next(err);
            }
        });
        this.router.patch('/', ...this.mw('patch'), async (req, res, next) => {
            try {
                await this.patch(req, res);
            } catch (err) {
                next(err);
            }
        });

        this._state = LifecycleState.INITIALIZED;
    }

    /** @inheritdoc */
    public async exit(): Promise<void> {
        if (this.state !== LifecycleState.INITIALIZED) {
            throw new IllegalStateError(
                'Cannot de-initialize a route that was not initialized'
            );
        }

        for (const child of this.children.values()) {
            if (child.state === LifecycleState.INITIALIZED) {
                await child.exit();
            } else {
                this.logger.w(
                    `Route ...${this.name}/${child.name} appears to have never been initialized`
                );
            }
        }

        this._state = LifecycleState.EXITED;

        for (const method of REQUEST_METHODS) {
            this.middleware ! [method] = [];
        }
    }

    /** @inheritdoc */
    public get state(): LifecycleState {
        return this._state;
    }

    /*
     * These handlers being all async may appear to negatively impact
     * performance, but in reality almost all handlers require some database
     * operation or similar stuff anyway, so this should not be too bad.
     */

    /**
     * Callback for HTTP GET requests to this route.
     * Will only get executed if all middleware handlers have succeeded.
     *
     * @param _req The request.
     * @param res The response.
     */
    public async get(_req: IRequest<any>, res: IResponse<any>): Promise<void> {
        res.status(HTTPStatusCode.METHOD_NOT_ALLOWED).json({
            err: true,
            msg: 'Method not allowed',
        });
    }

    /**
     * Callback for HTTP POST requests to this route.
     * Will only get executed if all middleware handlers have succeeded.
     *
     * @param _req The request.
     * @param res The response.
     */
    public async post(_req: IRequest<any>, res: IResponse<any>): Promise<void> {
        res.status(HTTPStatusCode.METHOD_NOT_ALLOWED).json({
            err: true,
            msg: 'Method not allowed',
        });
    }

    /**
     * Callback for HTTP PUT requests to this route.
     * Will only get executed if all middleware handlers have succeeded.
     *
     * @param _req The request.
     * @param res The response.
     */
    public async put(_req: IRequest<any>, res: IResponse<any>): Promise<void> {
        res.status(HTTPStatusCode.METHOD_NOT_ALLOWED).json({
            err: true,
            msg: 'Method not allowed',
        });
    }

    /**
     * Callback for HTTP DELETE requests to this route.
     * Will only get executed if all middleware handlers have succeeded.
     *
     * @param _req The request.
     * @param res The response.
     */
    public async delete(_req: IRequest<any>, res: IResponse<any>): Promise<void> {
        res.status(HTTPStatusCode.METHOD_NOT_ALLOWED).json({
            err: true,
            msg: 'Method not allowed',
        });
    }

    /**
     * Callback for HTTP PATCH requests to this route.
     * Will only get executed if all middleware handlers have succeeded.
     *
     * @param _req The request.
     * @param res The response.
     */
    public async patch(_req: IRequest<any>, res: IResponse<any>): Promise<void> {
        res.status(HTTPStatusCode.METHOD_NOT_ALLOWED).json({
            err: true,
            msg: 'Method not allowed',
        });
    }

    /**
     * Instantiate all middlewares for a specific request method handler.
     *
     * @param method The request method of which to instantiate the middleware
     *     handlers for.
     * @return The array of middleware handlers.
     */
    private mw(method: RequestMethodName): IRequestHandler[] {
        if (this.middleware === undefined) {
            return [];
        }

        const middlewares: IRequestHandler[] = [];
        for (const factory of this.middleware[method]) {
            middlewares.push(factory(this.logger, this.authSubsys, this.storageSubsys));
        }
        return middlewares;
    }

}
