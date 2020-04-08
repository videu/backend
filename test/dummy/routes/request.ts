/**
 * @file Create mock requests.
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
    Application as ExpressApplication,
    MediaType,
    NextFunction,
} from 'express-serve-static-core';
import { IncomingHttpHeaders } from 'http';
import { Socket } from 'net';
import RangeParser from 'range-parser';

import { IUser } from '../../../types/db/user';
import { IRequest, IResponse } from '../../../types/routes/route';

/**
 * Various options for instantiating a mock request.
 */
export interface IMockRequestOpts<T extends object | undefined = undefined> {
    /**
     * The `auth` field in the request.
     * If this is specified, the `Authorization` header is set as well.
     * However, that authorization header can be overridden by setting it in
     * the `headers` filed in this object.
     */
    auth?: {
        token: string;
        user: IUser;
    };
    /** The request body. */
    body: T;
    /**
     * A map of all request headers to set.
     * The `Content-Type` header is set automatically to `application/json`.
     */
    headers?: IncomingHttpHeaders;
}

/*
 * Interesting side note:
 * I never realized the tremendous size of these request objects until I
 * actually went ahead and implemented this class.  Let's pray to god the guys
 * from NodeJS or express never decide to change their APIs, I really don't want
 * to touch this ever again.
 */

/**
 * Stub implementation of an incoming HTTP request.
 * Instances of this class can be used to simulate any request for route
 * endpoints or middleware handlers.  Note that basically all of the methods
 * except the ones for accessing headers are not implemented.
 */
export class MockRequest<BodyType extends object | undefined = undefined>
implements IRequest<BodyType> {

    public body: BodyType | undefined;

    public auth?: { token: string; user: IUser; };

    public headers: IncomingHttpHeaders = {
        'content-type': 'application/json',
    };

    public accepted: MediaType[];
    public protocol: string;
    public secure: boolean;
    public ip: string;
    public ips: string[];
    public subdomains: string[];
    public path: string;
    public hostname: string;
    public host: string;
    public fresh: boolean;
    public stale: boolean;
    public xhr: boolean;
    public cookies: any;
    public method: string;
    public params: any;
    public query: any;
    public route: any;
    public signedCookies: any;
    public originalUrl: string;
    public url: string;
    public baseUrl: string;
    public app: ExpressApplication;
    public res?: IResponse<any>;
    public next?: NextFunction;
    public aborted: boolean;
    public httpVersion: string = '1.1';
    public httpVersionMajor: number;
    public httpVersionMinor: number;
    public complete: boolean;
    public connection: Socket;
    public socket: Socket;
    public rawHeaders: string[];
    public trailers: { [key: string]: string; };
    public rawTrailers: string[];
    public statusCode?: number;
    public statusMessage?: string;
    public readable: boolean;
    public readableHighWaterMark: number;
    public readableLength: number;
    public readableObjectMode: boolean;
    public destroyed: boolean;

    /**
     * Create a new mock request.
     *
     * @param opts Some options.
     */
    constructor(opts?: IMockRequestOpts) {
        if (opts) {

            if (opts.auth) {
                this.auth = opts.auth;
                this.headers.authorization = `Bearer ${opts.auth.token}`;
            }

            this.body = opts.body;

            if (opts.headers) {
                for (const header in opts.headers) {
                    if (Object.prototype.hasOwnProperty.call(opts.headers, header)) {
                        this.headers[header] = opts.headers[header];
                    }
                }
            }

        }
    }

    public get(name: 'set-cookie'): string[];
    public get(name: string): string;
    public get(name: string): string | string[] | undefined {
        return this.headers[name.toLowerCase()];
    }

    public header(name: 'set-cookie'): string[] | undefined;
    public header(name: string): string | undefined;
    public header(name: string): string | string[] | undefined {
        return this.headers[name.toLowerCase()];
    }

    public accepts(): string[];
    public accepts(type: string | string[]): string | false;
    public accepts(...type: string[]): string | false;
    public accepts(type?: any, ...rest: any[]): string | string[] | false {
        throw new Error('Unimplemented stub method');
    }

    public acceptsCharsets(): string[];
    public acceptsCharsets(charset: string | string[]): string | false;
    public acceptsCharsets(...charset: string[]): string | false;
    public acceptsCharsets(charset?: any, ...rest: any[]): string | string[] | false {
        throw new Error('Unimplemented stub method');
    }

    public acceptsEncodings(): string[];
    public acceptsEncodings(encoding: string | string[]): string | false;
    public acceptsEncodings(...encoding: string[]): string | false;
    public acceptsEncodings(encoding?: any, ...rest: any[]): string | string[] | false {
        throw new Error('Unimplemented stub method');
    }

    public acceptsLanguages(): string[];
    public acceptsLanguages(lang: string | string[]): string | false;
    public acceptsLanguages(...lang: string[]): string | false;
    public acceptsLanguages(lang?: any, ...rest: any[]): string | string[] | false {
        throw new Error('Unimplemented stub method');
    }

    public range(size: number, options?: RangeParser.Options): RangeParser.Ranges | -1 | -2 {
        throw new Error('Unimplemented stub method');
    }

    public param(name: string, defaultValue?: any): string {
        throw new Error('Unimplemented stub method');
    }

    public is(type: string | string[]): string | false {
        throw new Error('Unimplemented stub method');
    }

    public setTimeout(msecs: number, callback?: () => void): this {
        throw new Error('Unimplemented stub method');
    }

    public destroy(error?: Error): void {
        throw new Error('Unimplemented stub method');
    }

    public _read(size: number): void {
        throw new Error('Unimplemented stub method');
    }

    public read(size?: number) {
        throw new Error('Unimplemented stub method');
    }

    public setEncoding(encoding: string): this {
        throw new Error('Unimplemented stub method');
    }

    public pause(): this {
        throw new Error('Unimplemented stub method');
    }

    public resume(): this {
        throw new Error('Unimplemented stub method');
    }

    public isPaused(): boolean {
        throw new Error('Unimplemented stub method');
    }

    public unpipe(destination?: NodeJS.WritableStream): this {
        throw new Error('Unimplemented stub method');
    }

    public unshift(chunk: any, encoding?: BufferEncoding): void {
        throw new Error('Unimplemented stub method');
    }

    public wrap(oldStream: NodeJS.ReadableStream): this {
        throw new Error('Unimplemented stub method');
    }

    public push(chunk: any, encoding?: string): boolean {
        throw new Error('Unimplemented stub method');
    }

    public _destroy(error: Error, callback: (error?: Error) => void): void {
        throw new Error('Unimplemented stub method');
    }

    public addListener(
        event: 'close' | 'end' | 'pause' | 'readable' | 'resume',
        listener: () => void
    ): this;
    public addListener(event: 'data', listener: (chunk: any) => void): this;
    public addListener(event: 'error', listener: (err: Error) => void): this;
    public addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    public addListener(event: string | symbol, listener: (param?: any) => void): this {
        throw new Error('Unimplemented stub method');
    }

    public emit(event: 'close' | 'end' | 'pause' | 'readable' | 'resume'): boolean;
    public emit(event: 'data', chunk: any): boolean;
    public emit(event: 'error', err: Error): boolean;
    public emit(event: string | symbol, ...args: any[]): boolean;
    public emit(event: string, chunkOrErr?: any, ...args: any[]): boolean {
        throw new Error('Unimplemented stub method');
    }

    public on(event: 'close' | 'end' | 'pause' | 'readable' | 'resume', listener: () => void): this;
    public on(event: 'data', listener: (chunk: any) => void): this;
    public on(event: 'error', listener: (err: Error) => void): this;
    public on(event: string | symbol, listener: (...args: any[]) => void): this;
    public on(event: any, listener: any): this {
        throw new Error('Unimplemented stub method');
    }

    public once(
        event: 'close' | 'end' | 'pause' | 'readable' | 'resume',
        listener: () => void
    ): this;
    public once(event: 'data', listener: (chunk: any) => void): this;
    public once(event: 'error', listener: (err: Error) => void): this;
    public once(event: string | symbol, listener: (...args: any[]) => void): this;
    public once(event: any, listener: any): this {
        throw new Error('Unimplemented stub method');
    }

    public prependListener(
        event: 'close' | 'end' | 'pause' | 'pause' | 'readable' | 'resume',
        listener: () => void
    ): this;
    public prependListener(event: 'data', listener: (chunk: any) => void): this;
    public prependListener(event: 'error', listener: (err: Error) => void): this;
    public prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    public prependListener(event: string | symbol, listener: (param?: any) => void): this {
        throw new Error('Unimplemented stub method');
    }

    public prependOnceListener(
        event: 'close' | 'end' | 'pause' | 'readable' | 'resume',
        listener: () => void
    ): this;
    public prependOnceListener(event: 'data', listener: (chunk: any) => void): this;
    public prependOnceListener(event: 'error', listener: (err: Error) => void): this;
    public prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    public prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Unimplemented stub method');
    }

    public removeListener(
        event: 'close' | 'end' | 'pause' | 'readable' | 'resume', listener: () => void
    ): this;
    public removeListener(event: 'data', listener: (chunk: any) => void): this;
    public removeListener(event: 'error', listener: (err: Error) => void): this;
    public removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    public removeListener(event: any, listener: any): this {
        throw new Error('Unimplemented stub method');
    }

    public [Symbol.asyncIterator](): AsyncIterableIterator<any> {
        throw new Error('Unimplemented stub method');
    }

    public pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T {
        throw new Error('Unimplemented stub method');
    }

    public off(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Unimplemented stub method');
    }

    public removeAllListeners(event?: string | symbol): this {
        throw new Error('Unimplemented stub method');
    }

    public setMaxListeners(n: number): this {
        throw new Error('Unimplemented stub method');
    }

    public getMaxListeners(): number {
        throw new Error('Unimplemented stub method');
    }

    public listeners(event: string | symbol): Array<(...args: any[]) => void> {
        throw new Error('Unimplemented stub method');
    }

    public rawListeners(event: string | symbol): Array<(...args: any[]) => void> {
        throw new Error('Unimplemented stub method');
    }

    public listenerCount(type: string | symbol): number {
        throw new Error('Unimplemented stub method');
    }

    public eventNames(): Array<string | symbol> {
        throw new Error('Unimplemented stub method');
    }

}
