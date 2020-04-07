/**
 * @file Type definitions for the route interface.
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
import { Request, RequestHandler, Response } from 'express-serve-static-core';

import { ILifecycle } from '../core/lifecycle';
import { IUser } from '../db/user';
import { IErrorResponseBody, JSONResponseBody } from '../json/response';
import { FMWFactory } from './middleware';

/** Any HTTP request method name supported by videu. */
export type RequestMethodName = 'get' | 'post' | 'put' | 'delete' | 'patch';

/**
 * Base interface for incoming HTTP requests.
 *
 * @param RequestBody The request body type.
 */
export interface IRequest<RequestBody extends object = any>
extends Request<any, any, RequestBody> {

    /**
     * If this value exists, the request contained a valid `Authorization`
     * header and is therefore authenticated.
     */
    auth?: {
        /** The JSON Web Token this user authenticated with. */
        token: string;
        /** The user object. */
        user: IUser;
    };

}

/**
 * Base interface for outgoing HTTP responses.
 *
 * @param ResponseBody The response body type.
 */
export interface IResponse<ResponseBody extends JSONResponseBody = JSONResponseBody>
extends Response<ResponseBody | IErrorResponseBody> { }

/**
 * A request handler.
 * We need to watch out; the `RequestHandler` interface in express has the
 * request and response bodies in reverse order for some reason and should
 * therefore never be used to avoid nasty type errors.
 */
export interface IRequestHandler<
    RequestBody extends object = any,
    ResponseBody extends JSONResponseBody = any
> extends RequestHandler<any, ResponseBody | IErrorResponseBody, RequestBody> { }

/**
 * Holds an array of all middleware factories applied to request handlers.
 * An implementation of {@link IRoute} will instantiate them upon
 * initialization.
 */
export interface IMiddlewareFactories {
    /** All middleware factories  */
    get: FMWFactory[];
    post: FMWFactory[];
    put: FMWFactory[];
    delete: FMWFactory[];
    patch: FMWFactory[];
}

/**
 * Base interface for all classes implementing an API route.
 */
export interface IRoute extends ILifecycle {

    /**
     * This holds an array of all middleware **factories** per request method.
     * Using the `@middleware` decorator will result in the middleware factory
     * passed to the decorator to be inserted here.  Implementing classes need
     * to use these factories to create the middleware handlers for each request
     * method, and pass them to express accordingly.
     *
     * See {@link AbstractRoute#init} for how an implementation looks like.
     */
    readonly middleware: IMiddlewareFactories | undefined;

    /**
     * The route name; this becomes the name of the path segment.
     * Example: If a route named `user` is inserted on the top level, its
     * endpoints are reachable under `/user`. If that route had a child named
     * `auth`, that child's endpoints would be reachable under `/user/auth`,
     * and so on.
     */
    readonly name: string;

    /** A map of all child routes. */
    readonly children: Map<string, IRoute>;

    /**
     * The express router.
     * This is used by the {@link IHTTPSubsys} to add top-level routes to the
     * express app instance.
     */
    readonly router: ExpressRouter;

    /*
     * This interface deliberately lacks the individual request handlers so
     * that child interfaces can specify themselves what request methods they
     * support by extending just the corresponding I***Endpoint interfaces
     * (see below).  Additionally, this should make specifying types for the
     * request and response body objects a bit easier.
     */

}

/**
 * Any endpoint that has a HTTP GET handler.
 *
 * @param RequestBody The type of the request body in GET requests.
 * @param ResponseBody The type of the response body in GET requests.
 */
export interface IGetEndpoint<RequestBody extends object, ResponseBody extends JSONResponseBody>
extends IRoute {

    /** The request handler for GET requests. */
    get: IRequestHandler<RequestBody, ResponseBody>;

}

/**
 * Any endpoint that has a HTTP POST handler.
 *
 * @param RequestBody The type of the request body in POST requests.
 * @param ResponseBody The type of the response body in POST requests.
 */
export interface IPostEndpoint<RequestBody extends object, ResponseBody extends JSONResponseBody>
extends IRoute {

    /** The request handler for POST requests. */
    post: IRequestHandler<RequestBody, ResponseBody>;

}

/**
 * Any endpoint that has a HTTP PUT handler.
 *
 * @param RequestBody The type of the request body in PUT requests.
 * @param ResponseBody The type of the response body in PUT requests.
 */
export interface IPutEndpoint<RequestBody extends object, ResponseBody extends JSONResponseBody>
extends IRoute {

    /** The request handler for PUT requests. */
    put: IRequestHandler<RequestBody, ResponseBody>;

}

/**
 * Any endpoint that has a HTTP DELETE handler.
 *
 * @param RequestBody The type of the request body in DELETE requests.
 * @param ResponseBody The type of the response body in DELETE requests.
 */
export interface IDeleteEndpoint<RequestBody extends object, ResponseBody extends JSONResponseBody>
extends IRoute {

    /** The request handler for DELETE requests. */
    delete: IRequestHandler<RequestBody, ResponseBody>;

}

/**
 * Any endpoint that has a HTTP PATCH handler.
 *
 * @param RequestBody The type of the request body in PATCH requests.
 * @param ResponseBody The type of the response body in PATCH requests.
 */
export interface IPatchEndpoint<RequestBody extends object, ResponseBody extends JSONResponseBody>
extends IRoute {

    /** The request handler for PATCH requests. */
    patch: IRequestHandler<RequestBody, ResponseBody>;

}
