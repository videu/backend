/**
 * @file TypeScript type definitions for the `global.videu` object.
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

export interface IVersionConfig {
    /**
     * The full version string.
     *
     * This string strictly follows the SemVer standard as
     * documented at <https://semver.org/>:
     * `major.minor.patch-tag+commit`
     */
    readonly versionString: string;

    /** The major version number. */
    readonly major: number;

    /** The minor version number. */
    readonly minor: number;

    /** The patch number. */
    readonly patch: number;

    /** Optional tags like 'dev' or 'rc1'. */
    readonly tags: string[];
}

export interface IMasterConfig {
    /**
     * The log level.
     * There are 6 types of log messages: `debug`, `verbose`, `info`,
     * `warn`, `error`, and `severe`.  The `logLevel` field is an
     * integer that stores one bit per log stream in its 6 least
     * significant bits.  A message is logged if the following is true:
     * `<message log level> & global.videu.logLevel !== 0`
     */
    logLevel: number;

    /** The application name. */
    readonly appName: string;

    /** The unique name of this backend instance. */
    readonly instanceId: string;

    /** The backend server version. */
    readonly version: IVersionConfig;
}

declare global {
    namespace NodeJS {
        interface Global { /* tslint:disable-line: interface-name */

            /*
             * NOTE:
             * Even though TypeScript's (in this case debatable) choice of
             * keywords and syntax suggests otherwise, this definition does not
             * *override* but merely *extend* the original one as found in
             * `@types/node`.
             */

            /*
             * AND ANOTHER NOTE:
             * The reason why most configuration values are declared readonly is
             * basically security and reliability: values like the database
             * connection info are not intended to be changed during runtime,
             * and setting these fields readonly prevents any stupid decisions
             * I might happen to make at 3 am in the morning.  The only place
             * where configuration values should be set is the plain JavaScript
             * bootstrapping code found in `/bootstrap` and `/index.js`.
             */

            /** Global root configuration object for the videu platform. */
            readonly videu: IMasterConfig;

        }
    }
}
