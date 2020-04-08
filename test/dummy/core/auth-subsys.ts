/**
 * @file Stub auth subsystem implementation.
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
    sign as jwtSign,
    SignCallback,
    verify as jwtVerify,
    VerifyCallback,
} from 'jsonwebtoken';

import { IAuthConfig, IAuthSubsys } from '../../../types/core/auth-subsys';
import { LifecycleState } from '../../../types/core/lifecycle';
import { IStorageSubsys } from '../../../types/core/storage-subsys';
import { IUser } from '../../../types/db/user';

import { AuthError } from '../../../src/error/auth-error';
import { IllegalStateError } from '../../../src/error/illegal-state-error';
import { IECKeyPairPEM } from '../../../src/util/ec';
import { StubStorageSubsys } from './storage-subsys';

/**
 * Stub implementation of the auth subsystem.
 */
export class StubAuthSubsys implements IAuthSubsys {

    public config: IAuthConfig = {
        algo: 'ES256',
        expire: 3600,
        publicKeyFile: 'test/dummy/data/test-certs/valid.pub.pem',
        privateKeyFile: 'test/dummy/data/test-certs/valid.priv.pem',
    };

    public keyPair: IECKeyPairPEM | null = null;

    public id: string = 'auth';

    public state: LifecycleState = LifecycleState.CREATED;

    public storageSubsys: IStorageSubsys | null = null;

    constructor(config?: IAuthConfig) {
        if (config) {
            this.config = config;
        }
    }

    public sign(user: IUser): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.state !== LifecycleState.INITIALIZED) {
                reject(new IllegalStateError('Not initialized'));
                return;
            }

            const cb: SignCallback = (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            };

            jwtSign(
                {id: user.id},
                this.keyPair ! .privateKey,
                {
                    algorithm: this.config.algo,
                    expiresIn: this.config.expire,
                },
                cb
            );
        });
    }

    public verify(token: string): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            if (this.state !== LifecycleState.INITIALIZED) {
                reject(new IllegalStateError('Not initialized'));
                return;
            }

            const cb: VerifyCallback = async (err, decoded: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (typeof decoded !== 'object' || typeof decoded.id !== 'string') {
                    reject(new AuthError('Invalid token'));
                    return;
                }
                const user = await this.storageSubsys ! .userRepo.getById(decoded.id);
                if (user === null) {
                    reject(new AuthError('Invalid token'));
                } else {
                    resolve(user);
                }
            };

            jwtVerify(token, this.keyPair ! .publicKey, cb);
        });
    }

    public async init(storageSubsys: IStorageSubsys) {
        if (this.state !== LifecycleState.CREATED) {
            throw new IllegalStateError('Not in CREATED state');
        }
        if (storageSubsys.state !== LifecycleState.INITIALIZED) {
            throw new IllegalStateError('storage subsys not initialized');
        }

        this.storageSubsys = storageSubsys;
        this.state = LifecycleState.INITIALIZED;
    }

    public async exit() {
        this.state = LifecycleState.EXITED;
    }

}
