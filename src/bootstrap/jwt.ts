/**
 * @file Load the ECDSA key specified in the `VIDEU_JWT_PRIVKEY` and
 * `VIDEU_JWT_PUBKEY` environment variable.
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

import { ECKeyPairOptions, generateKeyPair } from 'crypto';

import { JWTKeyPair } from '../../types/global';

import { FBootstrapper } from '../../types/bootstrapper';
import { ILogger } from '../../types/logger';
import { readFile, readFileStr, stat, writeFile } from '../util/fs';
import { Logger } from '../util/logger';

const log: ILogger = new Logger('JWT');
let pubKeyPath: string | undefined = process.env.VIDEU_JWT_PUBKEY;
let privKeyPath: string | undefined = process.env.VIDEU_JWT_PRIVKEY;

/**
 * Generate a new secp256k1 EC key pair w/ SHA256.
 */
function generateCert(): Promise<JWTKeyPair> {
    return new Promise((resolve, reject) => {
        const opts: ECKeyPairOptions<'der', 'der'> = {
            namedCurve: 'secp256k1',
            publicKeyEncoding: {
                format: 'der',
                type: 'spki',
            },
            privateKeyEncoding: {
                format: 'der',
                type: 'pkcs8',
            },
        };

        generateKeyPair('ec', opts, (err, pubKey, privKey) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    pubKey: pubKey,
                    privKey: privKey,
                });
            }
        });
    });
}

/**
 * Read a public or private key from a file.
 * If the file extension is `.pem`, the file contents are decoded as a string.
 * In all other cases, the return value is a `Buffer`.
 *
 * @param path The path to the key.
 * @return the public or private key.
 */
async function readKey(path: string): Promise<Buffer | string> {
    const pathParts: string[] = path.split('.');
    const extension = pathParts[pathParts.length - 1];

    if (extension.toLowerCase() === 'pem') {
        return await readFileStr(path);
    } else {
        return await readFile(path);
    }
}

/** Bootstrapper for loading the JWT key. */
export const jwtBootstrap: FBootstrapper = async () => {
    /* TODO: Clean this mess up, chapter 2 */
    if (process.env.NODE_ENV === 'development') {
        if (pubKeyPath === undefined) {
            pubKeyPath = 'jwt.pub.der';
        }
        if (privKeyPath === undefined) {
            privKeyPath = 'jwt.der';
        }
    } else if (pubKeyPath === undefined || privKeyPath === undefined) {
        throw new Error('Development is disabled and no JWT certificate was specified');
    }

    try {
        /* TODO: Check certificate parts individually */
        await stat(pubKeyPath);
        await stat(privKeyPath);
    } catch (statErr) {
        if (process.env.NODE_ENV !== 'development') {
            throw new Error(
                'Development is disabled and JWT certificate file "'
                + pubKeyPath
                + '" does not exist'
            );
        }

        log.i('Generating an ECDSA certificate for JWT');

        try {
            global.videu.jwt = await generateCert();

            if (
                typeof global.videu.jwt.privKey === 'string'
                || typeof global.videu.jwt.pubKey === 'string'
            ) {
                throw new Error('generateCert() returned PEM format, I am too lazy to handle this');
            }

            await writeFile(pubKeyPath, global.videu.jwt.pubKey);
            await writeFile(privKeyPath, global.videu.jwt.privKey);
        } catch (genErr) {
            log.s('Generating the key pair failed', genErr);
            throw new Error('Cannot continue without a JWT certificate');
        }
    } finally {
        global.videu.jwt.pubKey = await readKey(pubKeyPath);
        global.videu.jwt.privKey = await readKey(privKeyPath);
        log.i('Certificate loaded');
    }
};
