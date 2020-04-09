/**
 * EC Certificate validation and generation utilities.
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
    createPrivateKey,
    createPublicKey,
    ECKeyPairOptions,
    generateKeyPair,
    KeyObject,
} from 'crypto';

import { asyncReadFile, asyncReadFileStr, asyncStat } from './fs';

/*
 * NOTE:
 * The function/variable names in this file may seem a little verbose.
 * This was a deliberate design choice, because this is one of those files that
 * probably shouldn't have any fuckups.  If changes are made, methods should be
 * kept as simple as possible and, if required, split into multiple ones.
 *
 * This is NOT the place to flex with particularily "elegant" solutions.
 */

/**
 * Stores an EC key pair in PEM format.
 */
export interface IECKeyPairPEM {

    /** The public key in PEM format. */
    publicKey: string;

    /** The private key in PEM format. */
    privateKey: string;

}

/** Any elliptic curve supported by videu. */
export type EllipticCurveName = 'secp256k1' | 'secp384k1' | 'secp512k1';

/**
 * Regular expression for testing whether a file contains a valid PEM public
 * key header.  **This is NOT safe for testing whether a PEM file is valid.**
 */
const publicKeyPEMHeaderRegex =
    /^\n*\-{5}BEGIN PUBLIC KEY\-{5}(.*\n)*\-{5}END PUBLIC KEY\-{5}\n*$/m;

/**
 * Generate a new EC key pair in PEM format.
 *
 * @param namedCurve The name of the elliptic curve to use.
 * @returns The EC key pair in PEM format.
 */
export function generateECKeyPair(namedCurve: EllipticCurveName = 'secp256k1'):
Promise<IECKeyPairPEM> {
    return new Promise((resolve, reject) => {
        const opts: ECKeyPairOptions<'pem', 'pem'> = {
            namedCurve: namedCurve,
            publicKeyEncoding: {
                format: 'pem',
                type: 'spki',
            },
            privateKeyEncoding: {
                format: 'pem',
                type: 'sec1',
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

/**
 * Determine the key format of a public or private key by examining the file
 * extension.  **This is NOT a guarantee** for the key being really in that
 * format, it is literally just a check if the filename ends in `.der` or
 * `.pem`. If the file extension is neither of those, an Error is thrown.
 *
 * @param filename The key file name.
 * @returns The format, as advertised by the file extension.
 */
export function guessKeyFormatByFileExtension(filename: string): ('der' | 'pem') {
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
        /* `asymmetricKeyType` cannot be undefined as the `type` property is not 'secret' */
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
        /* `asymmetricKeyType` cannot be undefined as the `type` property is not 'secret' */
        throw new Error(
            `Expected an EC key, but got ${privateKey.asymmetricKeyType?.toUpperCase()}`
        );
    }
}

/**
 * Load an EC public key in DER or PEM format from the specified file.
 * The file extension MUST be either `.der` (for DER format) or `.pem`
 * (for PEM format), otherwise an error is thrown.  The key must be of type
 * `spki`.
 *
 * @param publicKeyPath The path to the public key file.
 * @returns The parsed public key.
 */
export async function readECSpkiPublicKeyFromFile(publicKeyPath: string): Promise<KeyObject> {
    const publicKeyFormat: ('der' | 'pem') = guessKeyFormatByFileExtension(publicKeyPath);

    const publicKeyStats = await asyncStat(publicKeyPath);
    if (!publicKeyStats.isFile()) {
        throw new Error(`Cannot read public key: ${publicKeyPath} is not a regular file`);
    }

    let publicKeyFileContents: Buffer | string;
    if (publicKeyFormat === 'der') {
        publicKeyFileContents = await asyncReadFile(publicKeyPath);
    } else {
        publicKeyFileContents = await asyncReadFileStr(publicKeyPath);

        /*
         * The public key might be included in a private key file, which node's
         * crypto library is able to extract.  But we don't want that; this
         * function should ONLY read public keys, period.
         */
        if (!publicKeyPEMHeaderRegex.test(publicKeyFileContents)) {
            throw new Error('Public key has invalid PEM format');
        }
    }

    const publicKeyObject: KeyObject = createPublicKey({
        key: publicKeyFileContents,
        format: publicKeyFormat,
        type: 'spki',
    });

    validateECPublicKey(publicKeyObject);

    return publicKeyObject;
}

/**
 * Load an EC private key in DER or PEM format from the specified file.
 * The file extension MUST be either `.der` (for DER format) or `.pem`
 * (for PEM format), otherwise an error is thrown.  The key must be of type
 * `sec1`.
 *
 * @param privateKeyPath The path to the private key file.
 * @returns The parsed private key.
 */
export async function readECSec1PrivateKeyFromFile(privateKeyPath: string): Promise<KeyObject> {
    const privateKeyFormat: ('der' | 'pem') = guessKeyFormatByFileExtension(privateKeyPath);

    const privateKeyStats = await asyncStat(privateKeyPath);
    if (!privateKeyStats.isFile()) {
        throw new Error(`Cannot read private key: ${privateKeyPath} is not a regular file`);
    }

    let privateKeyFileContents: Buffer | string;
    if (privateKeyFormat === 'der') {
        privateKeyFileContents = await asyncReadFile(privateKeyPath);
    } else {
        privateKeyFileContents = await asyncReadFileStr(privateKeyPath);
    }

    const privateKeyObject: KeyObject = createPrivateKey({
        key: privateKeyFileContents,
        format: privateKeyFormat,
        type: 'sec1',
    });

    validateECPrivateKey(privateKeyObject);

    return privateKeyObject;
}

/**
 * Read an EC key pair from public and private key files and return the key
 * pair.  **This does NOT check if the two keys fit together.**
 * The public key MUST be a `spki` key, and the private key MUST be a `sec1`
 * key.  Throws an error if one of the certificate files could not be read or
 * if the keys are in an unsupported format.
 *
 * @param publicKeyPath The path to the public key file.
 * @param privateKeyPath The path to the private key file.
 * @returns The key pair in PEM format.
 */
export async function readECKeyPairFromFilesUnchecked(publicKeyPath: string,
                                                      privateKeyPath: string):
Promise<IECKeyPairPEM> {
    let publicKeyObject: KeyObject | null = null;
    let privateKeyObject: KeyObject | null = null;

    const publicKeyReadFn = async () => {
        publicKeyObject = await readECSpkiPublicKeyFromFile(publicKeyPath);
    };
    const privateKeyReadFn = async () => {
        privateKeyObject = await readECSec1PrivateKeyFromFile(privateKeyPath);
    };
    await Promise.all([
        publicKeyReadFn(),
        privateKeyReadFn(),
    ]);

    const publicKeyString: string = publicKeyObject ! .export({
        format: 'pem',
        type: 'spki',
    }) as string;
    const privateKeyString: string = privateKeyObject ! .export({
        format: 'pem',
        type: 'sec1',
    }) as string;

    const encoder = new TextEncoder();

    return {
        publicKey: publicKeyString,
        privateKey: privateKeyString,
    };
}
