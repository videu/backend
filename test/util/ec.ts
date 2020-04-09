/**
 * Unit test for the EC utilities.
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

import { expect } from 'chai';
import { createPrivateKey, createPublicKey } from 'crypto';
import { readFileSync } from 'fs';
import { describe } from 'mocha';

import {
    generateECKeyPair,
    readECKeyPairFromFilesUnchecked,
    readECSec1PrivateKeyFromFile,
    readECSpkiPublicKeyFromFile,
} from '../../src/util/ec';

/* see ../dummy/util/test-certs/README.md */
const PRIVKEY: string = new TextDecoder().decode(
    readFileSync('test/dummy/util/test-certs/valid.priv.pem')
);
const PUBKEY: string = new TextDecoder().decode(
    readFileSync('test/dummy/util/test-certs/valid.pub.pem')
);

describe('util/ec:generateECKeyPair', () => {
    it('should generate a valid PEM key pair', () => {
        const fn = async () => {
            const keyPair = await generateECKeyPair();
            createPublicKey({
                key: keyPair.publicKey,
                type: 'spki',
                format: 'pem',
            });
            createPrivateKey({
                key: keyPair.privateKey,
                type: 'sec1',
                format: 'pem',
            });
        };

        return expect(fn()).to.eventually.be.fulfilled;
    });
});

describe('util/ec:loadECSpkiPublicKeyFromFile', () => {
    it('should load an EC public key', () => {
        const fn = async () => {
            const publicKey = await readECSpkiPublicKeyFromFile(
                'test/dummy/util/test-certs/valid.pub.der'
            );
            return publicKey.export({
                format: 'pem',
                type: 'spki',
            });
        };

        return expect(fn()).to.eventually.deep.eq(PUBKEY);
    });

    it('should reject a private key in DER format', () => {
        return expect(readECSpkiPublicKeyFromFile('test/dummy/util/test-certs/valid.priv.der'))
            .to.eventually.be.rejected;
    });

    it('should reject a private key in PEM format', () => {
        return expect(readECSpkiPublicKeyFromFile('test/dummy/util/test-certs/valid.priv.pem'))
            .to.eventually.be.rejected;
    });

    it('should reject an RSA public key', () => {
        return expect(readECSpkiPublicKeyFromFile('test/dummy/util/test-certs/rsa.pub.pem'))
            .to.eventually.be.rejected;
    });

    it('should reject a directory', () => {
        return expect(readECSpkiPublicKeyFromFile('test/dummy/util/test-certs/directory.der'))
            .to.eventually.be.rejected;
    });
});

describe('util/ec:readECSec1PrivateKeyFromFile', () => {
    it('should load an EC private key', () => {
        const fn = async () => {
            const privateKey = await readECSec1PrivateKeyFromFile(
                'test/dummy/util/test-certs/valid.priv.der'
            );
            return privateKey.export({
                format: 'pem',
                type: 'sec1',
            });
        };

        return expect(fn()).to.eventually.deep.eq(PRIVKEY);
    });

    it('should reject a public key in DER format', () => {
        return expect(readECSec1PrivateKeyFromFile('test/dummy/util/test-certs/valid.pub.der'))
            .to.eventually.be.rejected;
    });

    it('should reject a public key in PEM format', () => {
        return expect(readECSec1PrivateKeyFromFile('test/dummy/util/test-certs/valid.pub.pem'))
            .to.eventually.be.rejected;
    });

    it('should reject an RSA public key', () => {
        return expect(readECSec1PrivateKeyFromFile('test/dummy/util/test-certs/rsa.priv.pem'))
            .to.eventually.be.rejected;
    });

    it('should reject a directory', () => {
        return expect(readECSec1PrivateKeyFromFile('test/dummy/util/test-certs/directory.der'))
            .to.eventually.be.rejected;
    });
});

describe('util/ec:readECKeyPairFromFilesUnchecked', () => {
    it('should load a valid DER key pair', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/valid.pub.der',
            'test/dummy/util/test-certs/valid.priv.der'
        )).to.eventually.deep.eq({
            publicKey: PUBKEY,
            privateKey: PRIVKEY,
        });
    });

    it('should load a valid PEM key pair', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/valid.pub.pem',
            'test/dummy/util/test-certs/valid.priv.pem'
        )).to.eventually.deep.eq({
            publicKey: PUBKEY,
            privateKey: PRIVKEY,
        });
    });

    it('should reject a public key w/ wrong file extension .der', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/wrong_file_extension.pub.der',
            'test/dummy/util/test-certs/valid.priv.der'
        )).to.eventually.be.rejected;
    });

    it('should reject a private key w/ wrong file extension (.der)', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/valid.pub.der',
            'test/dummy/util/test-certs/wrong_file_extension.priv.der'
        )).to.eventually.be.rejected;
    });

    it('should reject a public key w/ wrong file extension (.pem)', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/wrong_file_extension.pub.pem',
            'test/dummy/util/test-certs/valid.priv.pem'
        )).to.eventually.be.rejected;
    });

    it('should reject a private key w/ wrong file extension (.pem)', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/valid.pub.pem',
            'test/dummy/util/test-certs/wrong_file_extension.priv.pem'
        )).to.eventually.be.rejected;
    });

    it('should reject a public key w/ unknown file extension', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/unknown_file_extension.crt',
            'test/dummy/util/test-certs/valid.priv.der'
        )).to.eventually.be.rejected;
    });

    it('should reject a private key w/ unknown file extension', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/valid.pub.der',
            'test/dummy/util/test-certs/unknown_file_extension.priv.crt'
        )).to.eventually.be.rejected;
    });

    it('should reject a public key w/out file extension', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/no_file_extension_pub',
            'test/dummy/util/test-certs/valid.priv.der'
        )).to.eventually.be.rejected;
    });

    it('should reject a private key w/out file extension', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/valid.pub.der',
            'test/dummy/util/test-certs/no_file_extension_priv'
        )).to.eventually.be.rejected;
    });

    it('should reject a private key passed instead of a public key in DER format', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/private_as_public_key.pub.der',
            'test/dummy/util/test-certs/valid.priv.der'
        )).to.eventually.be.rejected;
    });

    it('should reject a public key passed instead of a private key in DER format', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/valid.pub.der',
            'test/dummy/util/test-certs/public_as_private_key.priv.der'
        )).to.eventually.be.rejected;
    });

    it('should reject a private key passed instead of a public key in PEM format', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/private_as_public_key.pub.pem',
            'test/dummy/util/test-certs/valid.priv.pem'
        )).to.eventually.be.rejected;
    });

    it('should reject a public key passed instead of a private key in PEM format', () => {
        return expect(readECKeyPairFromFilesUnchecked(
            'test/dummy/util/test-certs/valid.pub.pem',
            'test/dummy/util/test-certs/public_as_private_key.priv.pem'
        )).to.eventually.be.rejected;
    });
});
