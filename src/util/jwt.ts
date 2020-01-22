/**
 * @file Sign and validate JSON web tokens.
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
    Algorithm,
    sign as jwtSignInternal,
    SignCallback,
    SignOptions,
    verify as jwtVerifyInternal,
    VerifyCallback,
    VerifyOptions
} from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import '../../types/global';

import { IUser } from '../../types/db/user';
import { userRepo } from '../data/repository/user-repository';
import { AuthError } from '../error/auth-error';
import { objectIdRegex } from './regex';

/**
 * The ECDSA used for signing JWTs.
 *
 * TODO: Use an environment variable for this
 */
const SIGN_ALGO: Algorithm = 'ES256';

/** The options passed to `{@link jwtSignInternal}`. */
const SIGN_OPTS: SignOptions = {
    algorithm: SIGN_ALGO,
    /* TODO: Use an environment variable for this */
    expiresIn: 3600 * 24 * 30, // 30 days
};

/** The options passed to `{@link jwtVerifyInternal}`. */
const VERIFY_OPTS: VerifyOptions = {
    algorithms: [SIGN_ALGO],
};

/**
 * Generate a signed JSON web token for the specified user.
 *
 * @param user The user.
 * @returns The JWT to be sent to the authenticating client.
 */
export function jwtSign(user: IUser): Promise<string> {
    return new Promise((resolve, reject) => {
        const cb: SignCallback = (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        };

        jwtSignInternal(
            {id: user.id},
            global.videu.jwt.privKey,
            SIGN_OPTS,
            cb
        );
    });
}

/**
 * Validate a JSON web token.
 *
 * @param jwt The JSON web token.
 * @returns The user this token was assigned to.
 * @throws An error if the JWT could not be verified or the user this token was
 *         assigned to does not exist.
 */
export function jwtVerify(jwt: string): Promise<IUser> {
    return new Promise((resolve, reject) => {
        const cb: VerifyCallback = async (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            const typelessData: any = data;

            if (
                typeof typelessData !== 'object'
                || typeof typelessData.id !== 'string'
                || !objectIdRegex.test(typelessData.id)
            ) {
                reject(new AuthError('Invalid token'));
                return;
            }

            try {
                const user: IUser | null = await userRepo.getById(
                    new ObjectId(typelessData.id)
                );
                if (user === null) {
                    reject(new AuthError('User does not exist'));
                    return;
                }

                resolve(user);
                return;
            } catch (err) {
                reject(err);
                return;
            }
        };

        jwtVerifyInternal(jwt, global.videu.jwt.pubKey, VERIFY_OPTS, cb);
    });
}
