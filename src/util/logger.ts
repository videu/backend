/**
 * @file The logging utility.
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

import { ILogger } from '../types/logger';

/* tslint:disable:no-console */

type FLog = (message: any, ...optionalParams: any[]) => void;

interface IRealConsole {
    debug: FLog;
    log: FLog;
    info: FLog;
    warn: FLog;
    error: FLog;
}

const realConsole: IRealConsole = {
    debug: console.debug,
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
};

console.debug = function(message: any, ...optionalParams: any[]) {
    const date = new Date().toISOString();

    realConsole.debug(
        `${Logger.FMT_DIM}${date} [stderr] DEBUG: ${message}${Logger.FMT_RESET}`,
        ...optionalParams
    );
};

console.log = function(message: any, ...optionalParams: any[]) {
    const date = new Date().toISOString();

    realConsole.log(
        `${date} [stdout] LOG: ${message}`,
        ...optionalParams
    );
};

console.info = function(message: any, ...optionalParams: any[]) {
    const date = new Date().toISOString();

    realConsole.info(
        `${date} [stdout] INFO: ${message}`,
        ...optionalParams
    );
};

console.warn = function(message: any, ...optionalParams: any[]) {
    const date = new Date().toISOString();

    realConsole.warn(
        `${Logger.FMT_FG_YELLOW}${date} [stderr] WARN: ${message}${Logger.FMT_RESET}`,
        ...optionalParams
    );
};

console.error = function(message: any, ...optionalParams: any[]) {
    const date = new Date().toISOString();

    realConsole.error(
        `${Logger.FMT_FG_RED}${date} [stderr] ERROR: ${message}${Logger.FMT_RESET}`,
        ...optionalParams
    );
};

/**
 * A simple logger.
 */
export class Logger implements ILogger {

    public static readonly LEVEL_DEBUG: number = 0x01;
    public static readonly LEVEL_VERBOSE: number = 0x02;
    public static readonly LEVEL_INFO: number = 0x04;
    public static readonly LEVEL_WARN: number = 0x08;
    public static readonly LEVEL_ERROR: number = 0x10;
    public static readonly LEVEL_SEVERE: number = 0x20;

    public static readonly FMT_RESET: string = '\x1b[0m';
    public static readonly FMT_BRIGHT: string = '\x1b[1m';
    public static readonly FMT_DIM: string = '\x1b[2m';
    public static readonly FMT_UNDERSCORE: string = '\x1b[4m';

    public static readonly FMT_FG_BLACK: string = '\x1b[30m';
    public static readonly FMT_FG_RED: string = '\x1b[31m';
    public static readonly FMT_FG_GREEN: string = '\x1b[32m';
    public static readonly FMT_FG_YELLOW: string = '\x1b[33m';
    public static readonly FMT_FG_BLUE: string = '\x1b[34m';
    public static readonly FMT_FG_MAGENTA: string = '\x1b[35m';
    public static readonly FMT_FG_CYAN: string = '\x1b[36m';
    public static readonly FMT_FG_WHITE: string = '\x1b[37m';

    public static readonly FMT_BG_BLACK: string = '\x1b[40m';
    public static readonly FMT_BG_RED: string = '\x1b[41m';
    public static readonly FMG_BG_GREEN: string = '\x1b[42m';
    public static readonly FMT_BG_YELLOW: string = '\x1b[43m';
    public static readonly FMG_BG_BLUE: string = '\x1b[44m';
    public static readonly FMT_BG_MAGENTA: string = '\x1b[45m';
    public static readonly FMG_BG_CYAN: string = '\x1b[46m';
    public static readonly FMT_BG_WHITE: string = '\x1b[47m';

    private tag: string;

    /**
     * Create a new Logger.
     *
     * @param tag The tag name.
     */
    constructor(tag: string) {
        this.tag = tag;
    }

    /**
     * Return whether a message of `level` should be logged with the current
     * logging configuration.
     *
     * @param level The log level.
     * @returns `true` if the message should be logged, `false` otherwise.
     */
    public static shouldLog(level: number): boolean {
        return (level & global.videu.logLevel) !== 0;
    }

    /** @inheritdoc */
    public d(msg: string, err?: Error) {
        if (Logger.shouldLog(Logger.LEVEL_DEBUG)) {
            this.log(realConsole.debug, Logger.FMT_DIM, 'DEBUG', msg, err);
        }
    }

    /** @inheritdoc */
    public v(msg: string, err?: Error) {
        if (Logger.shouldLog(Logger.LEVEL_VERBOSE)) {
            this.log(realConsole.log, '', 'VERBOSE', msg, err);
        }
    }

    /** @inheritdoc */
    public i(msg: string) {
        if (Logger.shouldLog(Logger.LEVEL_INFO)) {
            this.log(realConsole.info, '', 'INFO', msg);
        }
    }

    /** @inheritdoc */
    public w(msg: string, err?: Error) {
        if (Logger.shouldLog(Logger.LEVEL_WARN)) {
            this.log(realConsole.warn, Logger.FMT_FG_YELLOW, 'WARN', msg, err);
        }
    }

    /** @inheritdoc */
    public e(msg: string, err?: Error) {
        if (Logger.shouldLog(Logger.LEVEL_ERROR)) {
            this.log(realConsole.error, Logger.FMT_FG_RED, 'ERROR', msg, err);
        }

    }

    /** @inheritdoc */
    public s(msg: string, err?: Error) {
        if (Logger.shouldLog(Logger.LEVEL_SEVERE)) {
            this.log(realConsole.error, Logger.FMT_FG_RED, 'SEVERE', msg, err);
        }
    }

    /** @inheritdoc */
    public wtf(msg: string, err?: Error) {
        this.log(realConsole.error, Logger.FMT_FG_RED, 'WTF', msg, err);
    }

    /**
     * Internal method for writing the actual line to the console.
     *
     * @param func   The logging function to use (either of `console.log`,
     *               `console.info`, `console.warn` or `console.err`).
     * @param prefix The prefix (used for log level).
     * @param msg    The message.
     * @param err    The error, if any.
     */
    protected log(func: FLog, color: string, prefix: string, msg: string,
                  err?: Error) {
        const lines: string[] = msg.split('\n');
        const date: string = new Date().toISOString();

        lines.forEach(line => {
            func(`${color}${date} [${this.tag}] ${prefix}: ${line}${Logger.FMT_RESET}`);
        });

        if (err !== undefined) {
            func(`${color}${date} [${this.tag}] ${prefix}: ${err}${Logger.FMT_RESET}`);
        }
    }

}

/**
 * Slightly modified version of {@link Logger} that logs route names as well.
 */
export class RouteLogger extends Logger {

    /** The route path. */
    private route: string;

    /**
     * Create a new route logger.
     *
     * @override
     * @param route The route name.
     */
    constructor(route: string) {
        super('Router');

        this.route = route;
    }

    /**
     * @override
     * @inheritdoc
     */
    protected log(func: FLog, color: string, prefix: string, msg: string,
                  err?: Error) {
        super.log(func, color, prefix, `[${this.route}] ${msg}`, err);
    }

}

/**
 * Parse a log level as specified in the configuration file.
 *
 * @param level The log level from the configuration file.
 */
export function parseLogLevel(level: string): number | undefined {
    let logLevel: number = 0x00;

    switch (level) {
        case 'debug':
            logLevel |= Logger.LEVEL_DEBUG;
            // fall through
        case 'verbose':
            logLevel |= Logger.LEVEL_VERBOSE;
            // fall through
        case 'info':
            logLevel |= Logger.LEVEL_INFO;
            // fall through
        case 'warn':
            logLevel |= Logger.LEVEL_WARN;
            // fall through
        case 'error':
            logLevel |= Logger.LEVEL_ERROR;
            // fall through
        case 'severe':
            logLevel |= Logger.LEVEL_SEVERE;
            break;
        default:
            return undefined;
    }

    return logLevel;
}
