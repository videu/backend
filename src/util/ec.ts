/**
 * @file EC Certificate validation and generation utilities.
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
    createPrivateKey,
    createPublicKey,
    ECKeyPairOptions,
    generateKeyPair,
    KeyObject,
} from 'crypto';

import { asyncReadFile, asyncStat } from './fs';

/**
 * Stores an EC key pair in DER format.
 */
export interface IECKeyPairDER {

    /** The public key in DER spki format. */
    publicKey: Buffer;

    /** The private key in DER pkcs8 format. */
    privateKey: Buffer;

}

/** Any elliptic curve supported by videu. */
export type EllipticCurveName = 'secp256k1' | 'secp384k1' | 'secp512k1';

/**
 * Generate a new EC key pair in DER format.
 *
 * @param namedCurve The name of the elliptic curve to use.
 * @return The EC key pair in DER format.
 */
export function generateECKeyPair(namedCurve: EllipticCurveName = 'secp256k1'):
Promise<IECKeyPairDER> {
    return new Promise((resolve, reject) => {
        const opts: ECKeyPairOptions<'der', 'der'> = {
            namedCurve: namedCurve,
            publicKeyEncoding: {
                format: 'der',
                type: 'spki',
            },
            privateKeyEncoding: {
                format: 'der',
                type: 'pkcs8',
            },
        };

        generateKeyPair('ec', opts, (err, publicKey, privateKey) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    publicKey: publicKey,
                    privateKey: privateKey,
                });
            }
        });
    });
}

function getKeyFormatByFileExtension(filename: string): ('der' | 'pem') {
    if (!filename.includes('.')) {
        throw new Error('File name must either have a .der or .pem extension');
    }

    const extension = filename.split('.').pop();
    if (extension !== 'der' && extension !== 'pem') {
        throw new Error(
            `Unknown file extension ${extension}, only .der and .pem are supported`
        );
    }

    return extension;
}

/**
 * Validate a public key to ensure it fits all requirements for use with videu.
 * Does nothing if the key is valid, and throws an Error if not.
 *
 * @param publicKey The public key.
 */
function validateECPublicKey(publicKey: KeyObject): void {
    if (publicKey.type !== 'public') {
        throw new Error(`Expected a public key, but got ${publicKey.type}`);
    }

    if (publicKey.asymmetricKeyType !== 'ec') {
        throw new Error(
            `Expected an EC key, gut got ${publicKey.asymmetricKeyType?.toUpperCase()}`
        );
    }
}

/**
 * Validate a private key to ensure it fits all requirements for use with videu.
 * Does nothing if the key is valid, and throws an Error if not.
 *
 * @param privateKey The private key.
 */
function validateECPrivateKey(privateKey: KeyObject): void {
    if (privateKey.type !== 'private') {
        throw new Error(`Expected a public key, but got ${privateKey.type}`);
    }

    if (privateKey.asymmetricKeyType !== 'ec') {
        throw new Error(
            `Expected an EC key, but got ${privateKey.asymmetricKeyType?.toUpperCase()}`
        );
    }
}

/**
 * Read an EC key pair from public and private key files and return the key pair
 * in DER format.  May throw an error if one of the certificate files could not
 * be read or if the keys are in an unsupported format.
 *
 * @param publicKeyPath The path to the public key file.
 * @param privateKeyPath The path to the private key file.
 * @return The key pair in DER format.
 */
export async function loadECKeyPairFromFiles(publicKeyPath: string, privateKeyPath: string):
Promise<IECKeyPairDER> {
    let publicKeyFormat: ('der' | 'pem');
    let privateKeyFormat: ('der' | 'pem');

    try {
        publicKeyFormat = getKeyFormatByFileExtension(publicKeyPath);
    } catch (err) {
        throw new Error(`Unable to read public key: ${err.message}`);
    }
    try {
        privateKeyFormat = getKeyFormatByFileExtension(privateKeyPath);
    } catch (err) {
        throw new Error(`Unable to read private key: ${err.message}`);
    }

    const publicKeyStats = await asyncStat(publicKeyPath);
    if (!publicKeyStats.isFile() && !publicKeyStats.isSymbolicLink()) {
        throw new Error('Cannot read public key: not a file');
    }

    const privateKeyStats = await asyncStat(privateKeyPath);
    if (!privateKeyStats.isFile() && !privateKeyStats.isSymbolicLink()) {
        throw new Error('Cannot read public key: not a file');
    }

    let publicKeyFileContents: Buffer | null = null;
    let privateKeyFileContents: Buffer | null = null;

    const publicKeyReadFn =
        async () => publicKeyFileContents = await asyncReadFile(publicKeyPath);
    const privateKeyReadFn =
        async () => privateKeyFileContents = await asyncReadFile(privateKeyPath);

    /*
     * Read both files in parallel to save like 10 ms of startup time and
     * possibly introduce errors in the process.  This is big brain.
     */
    await Promise.all([
        publicKeyReadFn(),
        privateKeyReadFn(),
    ]);

    /* Buffer cannot be null at this point because we `await`ed Promise.all() */
    const publicKeyObject: KeyObject = createPublicKey({
        key: publicKeyFileContents ! ,
        format: publicKeyFormat,
        type: 'spki',
    });
    const privateKeyObject: KeyObject = createPrivateKey({
        key: privateKeyFileContents ! ,
        format: privateKeyFormat,
        type: 'pkcs8',
    });

    validateECPublicKey(publicKeyObject);
    validateECPrivateKey(privateKeyObject);

    return {
        publicKey: publicKeyObject.export({
            format: 'der',
            type: 'spki',
        }),
        privateKey: privateKeyObject.export({
            format: 'der',
            type: 'pkcs8',
        }),
    };
}
