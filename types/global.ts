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

/* tslint:disable:interface-name */

/**
 * A DER (preferred) or PEM encoded EC secp256k1 key pair used for signing and
 * validating JSON Web Tokens.
 */
export interface JWTKeyPair {
    /** The public key (DER or PEM encoded). */
    pubKey: Buffer | string;
    /** The private key (DER or PEM encoded). */
    privKey: Buffer | string;
}

export interface MongoConfig {
    /** The MongoDB server host name or IP address. */
    readonly host: string;

    /** The MongoDB serever port. */
    readonly port: number;

    /** The database name. */
    readonly db: string;

    /**
     * The MongoDB user name to log in as.
     * If `null`, authentication is disabled.
     */
    readonly user: string | null;

    /**
     * The MongoDB password for the user name.
     * If `null`, authentication is disabled.
     */
    readonly passwd: string | null;

    /**
     * The MongoDB database to authenticate against.
     * Defaults to `admin`.
     */
    readonly authSource: string;

    /** Whether SSL should be used. */
    readonly ssl: boolean;
}

export interface SMTPConfig {
    /**
     * Whether to send emails.
     * If this is `false`, the entire configuration is ignored and the
     * SMTP subsystem is not loaded in the first place.
     */
    readonly enable: boolean;

    /** The SMTP host name. */
    readonly host: string;

    /** The SMTP port. */
    readonly port: number;

    /** How to establish a secure connection to the SMTP server. */
    readonly security: 'STARTTLS' | 'SSL';

    /** The SMTP user name. */
    readonly user: string;

    /** The SMTP password. */
    readonly passwd: string;

    /** The SMTP authentication method. */
    readonly authMethod: 'none' | 'plain';

    /** The `Reply-To` SMTP header. */
    readonly replyTo: string;

    /** The name to include in the `From` SMTP header. */
    readonly fromName: string;
}

export interface VersionConfig {
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

    /** Pptional tags like 'dev' or 'rc1'. */
    readonly tags: string[];
}

export interface MasterConfig {
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

    /** The key pair for signing JWTs. */
    jwt: JWTKeyPair;

    /** The port this server is listening on. */
    readonly port: number | null;

    /** The UNIX socket path this server is listening on. */
    readonly socket: string | null;

    /** MongoDB database configuration. */
    readonly mongo: MongoConfig;

    /** SMTP server configuration. */
    readonly smtp: SMTPConfig;

    /** The backend server version. */
    readonly version: VersionConfig;
}

declare global {
    namespace NodeJS {
        interface Global {

            /*
            * NOTE:
            * Even though TypeScript's (in this case debatable) choice of keywords
            * and syntax suggests otherwise, this definition does not *override*
            * but merely *extend* the original one as found in `@types/node`.
            */

            /*
            * AND ANOTHER NOTE:
            * The reason why most configuration values are declared readonly is
            * basically security and reliability: values like the database
            * connection info are not intended to be changed during runtime, and
            * setting these fields readonly prevents any stupid decisions I might
            * happen to make at 3 am in the morning.  The only place where
            * configuration values should be set is the plain JavaScript
            * bootstrapping code found in `/bootstrap` and `/index.js`.
            */

            /** Global root configuration object for the videu platform. */
            readonly videu: MasterConfig;

        }
    }
}
