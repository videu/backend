/**
 * Create mock requests.
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

import {
    Application as ExpressApplication,
    CookieOptions,
    Errback,
    ParamsDictionary,
    Request as ExpressRequest,
    Send,
} from 'express-serve-static-core';
import { OutgoingHttpHeaders } from 'http';
import { Socket } from 'net';
import { Readable } from 'stream';

import {
    HTTPStatusCode,
    IErrorResponseBody,
    JSONResponseBody
} from '../../../types/json/response';
import { IResponse } from '../../../types/routes/route';

import { MockRequest } from './request';

/**
 * Stub implementation of an outgoing HTTP response.
 * Instances of this class can be passed to route endpoints or middleware
 * handlers and then inspected in the test functions.  Note that basically none
 * of the methods except the ones for header/body stuff are implemented.
 */
export class MockResponse<ResponseBody extends JSONResponseBody>
implements IResponse<ResponseBody> {

    public body?: ResponseBody | IErrorResponseBody;
    public headers: OutgoingHttpHeaders = {
        'content-type': 'application/json',
    };
    public statusCode: HTTPStatusCode = -1;

    public app: ExpressApplication;
    public req?: ExpressRequest<ParamsDictionary, any, any>;
    public statusMessage: string = '';
    public headersSent: boolean = false;
    public locals: any;
    public charset: string = 'utf-8';
    public writable: boolean = true;
    public writableEnded: boolean = false;
    public writableFinished: boolean = false;
    public writableHighWaterMark: number = 0;
    public writableLength: number = 0;
    public writableObjectMode: boolean = false;
    public writableCorked: number = 0;
    public destroyed: boolean = false;
    public upgrading: boolean = false;
    public chunkedEncoding: boolean = false;
    public shouldKeepAlive: boolean = false;
    public useChunkedEncodingByDefault: boolean = false;
    public sendDate: boolean = true;
    public finished: boolean = false;
    public connection: Socket = null as any as Socket;
    public socket: Socket = null as any as Socket;

    public constructor(app: ExpressApplication, req?: MockRequest) {
        this.app = app;
        this.req = req;
    }

    public status(code: number): this {
        if (this.headersSent) {
            throw new Error('Headers already sent');
        }

        this.statusCode = code;
        this.headersSent = true;
        return this;
    }

    public header(field: any): this;
    public header(field: string, value?: string | string[]): this;
    public header(field: any, value?: any): this {
        if (this.headersSent) {
            throw new Error('Headers already sent');
        }

        if (typeof field !== 'string') {
            throw new TypeError('Header field must be a string');
        }
        let _value: string;
        if (typeof value === 'string') {
            _value = value;
        } else if (Array.isArray(value)) {
            _value = value.join(' ');
        } else {
            throw new TypeError('Header value must be a string or string array');
        }

        this.headers[field] = _value;
        return this;
    }

    public get(field: string): string {
        const val = this.headers[field];
        if (val === undefined) {
            return '';
        }
        if (Array.isArray(val)) {
            return val.join(' ');
        }
        if (typeof val === 'number') {
            return val.toString();
        }
        return val;
    }

    public json(body: ResponseBody | IErrorResponseBody | undefined) {
        if (this.body) {
            throw new Error('Body already sent');
        }

        this.body = body;
        this.headersSent = true;
        this.finished = true;
        return this;
    }

    public sendStatus(code: number): this {
        throw new Error('Method not implemented.');
    }

    public links(links: any): this {
        throw new Error('Method not implemented.');
    }

    public send: Send<ResponseBody | IErrorResponseBody, this> = () => {
        throw new Error('Method not implemented.');
    }

    public jsonp: Send<ResponseBody | IErrorResponseBody, this> = () => {
        throw new Error('Method not implemented.');
    }

    public sendFile(path: string, fn?: Errback): void;
    public sendFile(path: string, options: any, fn?: Errback): void;
    public sendFile(path: any, options?: any, fn?: any) {
        throw new Error('Method not implemented.');
    }

    public sendfile(path: string, optionsOrCallback?: Errback | any): void;
    public sendfile(path: string, fn: Errback): void;
    public sendfile(path: string, options: any, fn: Errback): void;
    public sendfile(path: any, options?: any, fn?: any) {
        throw new Error('Method not implemented.');
    }

    public download(path: string, fn?: Errback): void;
    public download(path: string, filename: string, fn?: Errback): void;
    public download(path: string, filename: string, options: any, fn?: Errback): void;
    public download(path: any, filename?: any, options?: any, fn?: any) {
        throw new Error('Method not implemented.');
    }

    public contentType(type: string): this {
        throw new Error('Method not implemented.');
    }

    public type(type: string): this {
        throw new Error('Method not implemented.');
    }

    public format(obj: any): this {
        throw new Error('Method not implemented.');
    }

    public attachment(filename?: string): this {
        throw new Error('Method not implemented.');
    }

    public set(field: any): this;
    public set(field: string, value?: string | string[]): this;
    public set(field: any, value?: any): this {
        throw new Error('Method not implemented.');
    }

    public clearCookie(name: string, options?: any): this {
        throw new Error('Method not implemented.');
    }

    public cookie(name: string, val: string | any, options: CookieOptions): this;
    public cookie(name: string, val: any): this;
    public cookie(name: any, val: any, options?: any): this {
        throw new Error('Method not implemented.');
    }

    public location(url: string): this {
        throw new Error('Method not implemented.');
    }

    public redirect(url: string): void;
    public redirect(status: number, urlOrStatus: string | number): void;
    public redirect(url: any, status?: any) {
        throw new Error('Method not implemented.');
    }

    public render(
        view: string,
        options?: object,
        callback?: (err: Error, html: string) => void
    ): void;
    public render(view: string, callback?: (err: Error, html: string) => void): void;
    public render(view: any, optionsOrCallback?: any, callback?: any): void {
        throw new Error('Method not implemented.');
    }

    public vary(field: string): this {
        throw new Error('Method not implemented.');
    }

    public append(field: string, value?: string | string[]): this {
        throw new Error('Method not implemented.');
    }

    public assignSocket(socket: Socket): void {
        throw new Error('Method not implemented.');
    }

    public detachSocket(socket: Socket): void {
        throw new Error('Method not implemented.');
    }

    public writeContinue(callback?: () => void): void {
        throw new Error('Method not implemented.');
    }

    public writeHead(
        statusCode: number,
        reasonPhrase?: string,
        headers?: OutgoingHttpHeaders
    ): this;
    public writeHead(statusCode: number, headers?: OutgoingHttpHeaders): this;
    public writeHead(statusCode: any, reasonPhrase?: any, headers?: any): this {
        throw new Error('Method not implemented.');
    }

    public writeProcessing(): void {
        throw new Error('Method not implemented.');
    }

    public setTimeout(msecs: number, callback?: () => void): this {
        throw new Error('Method not implemented.');
    }

    public setHeader(name: string, value: string | number | string[]): void {
        throw new Error('Method not implemented.');
    }

    public getHeader(name: string): string | number | string[] {
        throw new Error('Method not implemented.');
    }

    public getHeaders(): import('http').OutgoingHttpHeaders {
        throw new Error('Method not implemented.');
    }

    public getHeaderNames(): string[] {
        throw new Error('Method not implemented.');
    }

    public hasHeader(name: string): boolean {
        throw new Error('Method not implemented.');
    }

    public removeHeader(name: string): void {
        throw new Error('Method not implemented.');
    }

    public addTrailers(headers: OutgoingHttpHeaders | Array<[string, string]>): void {
        throw new Error('Method not implemented.');
    }

    public flushHeaders(): void {
        throw new Error('Method not implemented.');
    }

    public _write(chunk: any, encoding: string, callback: (error?: Error) => void): void {
        throw new Error('Method not implemented.');
    }

    public _writev?(
        chunks: Array<{ chunk: any; encoding: string; }>,
        callback: (error?: Error) => void
    ): void {
        throw new Error('Method not implemented.');
    }

    public _destroy(error: Error, callback: (error?: Error) => void): void {
        throw new Error('Method not implemented.');
    }

    public _final(callback: (error?: Error) => void): void {
        throw new Error('Method not implemented.');
    }

    public write(chunk: any, cb?: (error: Error) => void): boolean;
    public write(chunk: any, encoding: string, cb?: (error: Error) => void): boolean;
    public write(chunk: any, encoding?: any, cb?: any): boolean {
        throw new Error('Method not implemented.');
    }

    public setDefaultEncoding(encoding: string): this {
        throw new Error('Method not implemented.');
    }

    public end(cb?: () => void): void;
    public end(chunk: any, cb?: () => void): void;
    public end(chunk: any, encoding: string, cb?: () => void): void;
    public end(chunk?: any, encoding?: any, cb?: any) {
        throw new Error('Method not implemented.');
    }

    public cork(): void {
        throw new Error('Method not implemented.');
    }

    public uncork(): void {
        throw new Error('Method not implemented.');
    }

    public destroy(error?: Error): void {
        throw new Error('Method not implemented.');
    }

    public addListener(event: 'close' | 'drain' | 'finish' | 'unpipe', listener: () => void): this;
    public addListener(event: 'error', listener: (err: Error) => void): this;
    public addListener(event: 'pipe', listener: (src: import('stream').Readable) => void): this;
    public addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    public addListener(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }

    public emit(event: 'close' | 'drain' | 'finish' | 'unpipe'): boolean;
    public emit(event: 'error', err: Error): boolean;
    public emit(event: 'pipe', src: import('stream').Readable): boolean;
    public emit(event: string | symbol, ...args: any[]): boolean;
    public emit(event: any, src?: any, ...args: any[]): boolean {
        throw new Error('Method not implemented.');
    }

    public on(event: 'close' | 'drain' | 'finish' | 'unpipe', listener: () => void): this;
    public on(event: 'error', listener: (err: Error) => void): this;
    public on(event: 'pipe', listener: (src: import('stream').Readable) => void): this;
    public on(event: string | symbol, listener: (...args: any[]) => void): this;
    public on(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }

    public once(event: 'close' | 'drain' | 'finish' | 'unpipe', listener: () => void): this;
    public once(event: 'error', listener: (err: Error) => void): this;
    public once(event: 'pipe', listener: (src: Readable) => void): this;
    public once(event: string | symbol, listener: (...args: any[]) => void): this;
    public once(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }

    public prependListener(
        event: 'close' | 'drain' | 'finish',
        listener: () => void
    ): this;
    public prependListener(event: 'error', listener: (err: Error) => void): this;
    public prependListener(event: 'pipe' | 'unpipe', listener: (src: Readable) => void): this;
    public prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    public prependListener(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }

    public prependOnceListener(event: 'close' | 'drain' | 'finish', listener: () => void): this;
    public prependOnceListener(event: 'error', listener: (err: Error) => void): this;
    public prependOnceListener(event: 'pipe' | 'unpipe', listener: (src: Readable) => void): this;
    public prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    public prependOnceListener(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }

    public removeListener(event: 'close' | 'drain' | 'finish', listener: () => void): this;
    public removeListener(event: 'error', listener: (err: Error) => void): this;
    public removeListener(event: 'pipe' | 'unpipe', listener: (src: Readable) => void): this;
    public removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    public removeListener(event: any, listener: any): this {
        throw new Error('Method not implemented.');
    }

    public pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T {
        throw new Error('Method not implemented.');
    }

    public off(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }

    public removeAllListeners(event?: string | symbol): this {
        throw new Error('Method not implemented.');
    }

    public setMaxListeners(n: number): this {
        throw new Error('Method not implemented.');
    }

    public getMaxListeners(): number {
        throw new Error('Method not implemented.');
    }

    public listeners(event: string | symbol): Array<(...params: any[]) => any> {
        throw new Error('Method not implemented.');
    }

    public rawListeners(event: string | symbol): Array<(...params: any[]) => any> {
        throw new Error('Method not implemented.');
    }

    public listenerCount(type: string | symbol): number {
        throw new Error('Method not implemented.');
    }

    public eventNames(): Array<string | symbol> {
        throw new Error('Method not implemented.');
    }

}
