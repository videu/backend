/**
 * @file Utility functions for password hashing and validation.
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

import { compare as bcryptCompare, hash as bcryptHash } from 'bcrypt';

/** A text encoder used to get the password length in bytes. */
const binaryEncoder: TextEncoder = new TextEncoder();

/** The default number of hashing rounds. */
export const DEFAULT_ROUNDS: number = 10;
/** The minimum number of hashing rounds. */
export const MIN_ROUNDS: number = 6;
/** THe minimum password length (in characters). */
export const PASSWD_MIN_LENGTH: number = 8;
/** The maximum password length (in bytes). */
export const PASSWD_MAX_BYTES: number = 72;

/**
 * Compute the salted bcrypt hash for a password.
 * The password must be at least `{@link PASSWD_MIN_LENGTH}` characters and at
 * most {@link PASSWD_MAX_BYTES} bytes long, and not contain any ASCII `NUL`
 * characters.
 *
 * @param passwd The cleartext password.
 * @param rounds The difficulty to calculate the hash with.
 * Defaults to `{@link DEFAULT_ROUNDS}` if not specified and must be at least
 * `{@link MIN_ROUNDS}`.
 * @returns The bcrypt-hashed password.
 */
export function passwdHash(passwd: string, rounds: number = DEFAULT_ROUNDS): Promise<string> {
    return new Promise((resolve, reject) => {
        if (passwd.length < PASSWD_MIN_LENGTH) {
            reject(new RangeError(
                `Password must be at least ${PASSWD_MIN_LENGTH} characters long`
            ));
            return;
        }

        if (binaryEncoder.encode(passwd).length > PASSWD_MAX_BYTES) {
            reject(new RangeError(
                `Password must be at most ${PASSWD_MAX_BYTES} bytes in size`
            ));
            return;
        }

        if (rounds < MIN_ROUNDS) {
            reject(new RangeError('At least 6 hashing rounds are required'));
            return;
        }

        if (passwd.includes('\0')) {
            reject(new RangeError('Password must not contain NUL characters'));
            return;
        }

        bcryptHash(passwd, rounds, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

/**
 * Verify that `passwd` matches the specified hash.
 *
 * @param passwd The user-supplied cleartext password.
 * @param hash The bcrypt hash string from the database.
 * @returns `true` if the password matches the given hash, `false` otherwise.
 */
export function passwdVerify(passwd: string, hash: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        /*
         * We skip binary-encoding the password and just check that it contains
         * less than 72 characters for performance.  That means we are passing
         * more than 72 bytes to bcrypt if it contains Unicode characters, but
         * that does not harm security as any excess bytes are truncated.
         */
        if (
            passwd.length < PASSWD_MIN_LENGTH
            || passwd.length > PASSWD_MAX_BYTES
            || passwd.includes('\0')
        ) {
            resolve(false);
            return;
        }

        try {
            const result: boolean = await bcryptCompare(passwd, hash);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}
