/**
 * @file Load the ECDSA key specified in the `VIDEU_JWT_SECRET' environment variable.
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

// TODO: Clean up this horrible mess

import { generateKeyPairSync, KeyPairSyncResult } from 'crypto';
import { readFileSync, stat } from 'fs';

import { ILogger } from '../types/logger';
import { Logger } from '../util/logger';

const log: ILogger = new Logger('JWT');
let certPath: string | undefined = process.env.VIDEU_JWT_SECRET;

function generateCert() {
    const result: KeyPairSyncResult<string, string> = generateKeyPairSync('ec', {
        namedCurve: 'secp521r1',
        publicKeyEncoding: {
            format: 'pem',
            type: 'pkcs1',
        },
        privateKeyEncoding: {
            format: 'pem',
            type: 'pkcs8',
        },
    });
    global.videu.jwtSecret = result.privateKey + '\n' + result.publicKey;
}

if (certPath === undefined) {
    if (process.env.NODE_ENV === 'development') {
        certPath = 'jwt.pem';
    } else {
        log.s('Not in development mode and no JWT signing certificate specified');
        // TODO: gracefully shut down
        process.exit(1);
    }
}

stat(certPath, err => {
    if (err) {
        if (process.env.NODE_ENV === 'development') {
            log.d('Generating an ECDSA certificate for JWT');
            generateCert();
        } else {
            log.s(`Certificate file ${certPath} not found`);
            process.exit(1);
        }
    } else {
        global.videu.jwtSecret = new TextDecoder().decode(readFileSync(certPath || ''));
    }
});
