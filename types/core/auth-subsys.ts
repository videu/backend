/**
 * Interface definition for the auth subsystem.
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

import { Algorithm as JWTAlgorithm } from 'jsonwebtoken';

import { IConfigurable } from '../configurable';
import { IUser } from '../db/user';
import { IObjectSchema } from '../util/object-schema';
import { IStorageSubsys } from './storage-subsys';
import { ISubsys } from './subsys';

/**
 * Configuration structure for the HTTP server subsystem.
 */
export interface IAuthConfig {

    /** The ECDSA used for signing keys.  Defaults to `'ES256'`. */
    algo: 'ES256' | 'ES384' | 'ES512';

    /**
     * The amount of seconds after which a token expires.
     * Defaults to 30 days (2,592,000 seconds).
     */
    expire: number;

    /**
     * The path to the public key file for JWT signing.
     *
     * This must be a DER-encoded EC public key filename that ends in `.der`.
     * If neither the `publicKey` nor the `privateKey` file exists AND the
     * server is in development mode, a new key pair is generated automatically.
     * In all other cases, the server will refuse to start.
     */
    publicKeyFile: string;

    /**
     * The path to the private key file for JWT signing.
     *
     * This must be a DER-encoded EC private key filename that ends in `.der`.
     * If neither the `privateKey` nor the `publiceKey` file exists AND the
     * server is in development mode, a new key pair is generated automatically.
     * In all other cases, the server will refuse to start.
     */
    privateKeyFile: string;

}

/** Auth subsystem config schema. */
export const AUTH_SUBSYS_CONFIG_SCHEMA: IObjectSchema = {
    algo: {
        type: 'string',
        regex: /^ES(256)|(384)|(512)$/,
        default: 'ES256',
    },
    expire: {
        type: 'number',
        range: [0, Number.MAX_SAFE_INTEGER],
        default: 3600 * 24 * 30, /* 30 days */
    },
    publicKeyFile: {
        type: 'string',
        regex: /(\.der)|(\.pem)$/,
        default: 'jwt.pub.pem',
    },
    privateKeyFile: {
        type: 'string',
        regex: /(\.der)|(\.pem)$/,
        default: 'jwt.priv.pem',
    },
};

/**
 * Interface for the auth subsystem.
 */
export interface IAuthSubsys extends ISubsys<[IStorageSubsys]>, IConfigurable<IAuthConfig> {

    /**
     * Generate a signed JSON Web Token for the specified user.
     *
     * @param user The user.
     * @returns The JWT.
     */
    sign(user: IUser): Promise<string>;

    /**
     * Verify the signature of a JSON Web Token.
     * If the token is valid, the user that this token was issued to is
     * returned.  If not, an {@linkcode AuthError} is thrown.
     *
     * @param token The token to verify.
     * @returns The user this token was issued to.
     * @throws An {@linkcode AuthError} if the token's signature is invalid.
     */
    verify(token: string): Promise<IUser>;

}
