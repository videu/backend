/**
 * @file Mongo subsystem implementation.
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
    sign as jwtSignInternal,
    SignCallback as JWTSignCallback,
    verify as jwtVerifyInternal,
    VerifyCallback as JWTVerifyCallback,
} from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import {
    AUTH_SUBSYS_CONFIG_SCHEMA,
    IAuthConfig,
    IAuthSubsys,
} from '../../types/core/auth-subsys';
import { LifecycleState } from '../../types/core/lifecycle';
import { IStorageSubsys } from '../../types/core/storage-subsys';
import { IUserRepository } from '../../types/data/repository/user';
import { IUser } from '../../types/db/user';

import { AuthError } from '../error/auth-error';
import { IllegalStateError } from '../error/illegal-state-error';
import { InvalidConfigError } from '../error/invalid-config-error';
import { toIntSafe } from '../util/conversions';
import { generateECKeyPair, IECKeyPairDER, readECKeyPairFromFilesUnchecked } from '../util/ec';
import { asyncWriteFile, canStat } from '../util/fs';
import { objectIdRegex } from '../util/regex';
import { AbstractSubsysConfigurable } from './abstract-subsys';

/** The payload for JWTs. */
interface ITokenPayload {
    /** The user id this token was issued to. */
    id: string;
}

/**
 * Auth subsystem implementation.
 */
export class AuthSubsys
extends AbstractSubsysConfigurable<IAuthConfig, [IStorageSubsys]>
implements IAuthSubsys {

    /** The key pair in DER format. */
    private keyPair: IECKeyPairDER | null = null;

    /** The user repository to get the user data from. */
    private userRepo: IUserRepository | null = null;

    /**
     * Instantiate the Mongo Subsystem (there should only really exist one
     * instance of this class at any time).
     *
     * @param config The optional configuration object.  If left out, the config
     *     will be parsed from environment variables.
     */
    constructor(config: IAuthConfig | null = null) {
        super('auth', config, AUTH_SUBSYS_CONFIG_SCHEMA);
    }

    /** @inheritdoc */
    public sign(user: IUser): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.state !== LifecycleState.INITIALIZED) {
                reject(new IllegalStateError('Subsystem not initialized'));
                return;
            }

            const cb: JWTSignCallback = (err, token) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    resolve(token);
                    return;
                }
            };

            const payload: ITokenPayload = { id: user.id };

            jwtSignInternal(
                payload,
                this.keyPair ! .privateKey,
                {
                    algorithm: this.config.algo,
                    expiresIn: this.config.expire,
                },
                cb
            );
        });
    }

    /** @inheritdoc */
    public verify(token: string): Promise<IUser> {
        return new Promise((resolve, reject) => {
            if (this.state !== LifecycleState.INITIALIZED) {
                reject(new IllegalStateError('Subsystem not initialized'));
                return;
            }

            const cb: JWTVerifyCallback = async (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                const typedData: ITokenPayload = data as ITokenPayload;

                if (
                    typeof typedData !== 'object'
                    || typeof typedData.id !== 'string'
                    || !objectIdRegex.test(typedData.id)
                ) {
                    reject(new AuthError('Invalid token'));
                    return;
                }

                try {
                    const user: IUser | null = await this.userRepo ! .getById(
                        new ObjectId(typedData.id)
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
            }; /* <-- end of verify callback */

            jwtVerifyInternal(
                token,
                this.keyPair ! .publicKey,
                { algorithms: [ this.config.algo ] },
                cb
            );
        });
    }

    /**
     * @inheritdoc
     * @override
     */
    protected async onInit(storageSubsys: IStorageSubsys) {
        await super.onInit(storageSubsys);

        this.userRepo = storageSubsys.userRepo;

        const publicKeyExists = await canStat(this.config.publicKey);
        const privateKeyExists = await canStat(this.config.privateKey);

        if (publicKeyExists && privateKeyExists) {

            this.keyPair = await readECKeyPairFromFilesUnchecked(
                this.config.publicKey,
                this.config.privateKey
            );

        } else if (!publicKeyExists && !privateKeyExists) {

            if (process.env.NODE_ENV === 'development') {
                this.logger.i('Signing key not found, generating one for you');
                this.keyPair = await this.generateAndStoreKeyPair();
                this.logger.i(
                    `Written public key to ${this.config.publicKey}, `
                    + `private key to ${this.config.privateKey}`
                );
            } else {
                throw new InvalidConfigError('Public and private key files do not exist');
            }

        } else {

            if (publicKeyExists) {
                throw new InvalidConfigError(
                    `Public key "${this.config.publicKey}" exists, `
                    + `but private key "${this.config.privateKey}" doesn't`
                );
            } else {
                throw new InvalidConfigError(
                    `Private key "${this.config.privateKey}" exists, `
                    + `but public key "${this.config.publicKey}" doesn't`
                );
            }

        }

        /* For compatibility with src/util/jwt.ts */

        /* TODO: Make this obsolete */
        global.videu.jwt.pubKey = this.keyPair.publicKey;
        global.videu.jwt.privKey = this.keyPair.privateKey;
    }

    /** @inheritdoc */
    protected async onExit() {
        this.keyPair = null;
        this.userRepo = null;
    }

    /** @inheritdoc */
    protected readConfigFromEnv(): IAuthConfig {
        /*
         * toIntSafe() returning undefined below if the number was invalid
         * wouldn't be too bad normally (it just would result in the default
         * being used), but since this is security-ciritcal we play it safe.
         */
        if (process.env.VIDEU_AUTH_EXPIRE) {
            if (toIntSafe(process.env.VIDEU_AUTH_EXPIRE) === undefined) {
                throw new InvalidConfigError('JWT expire time is not a valid number');
            }
        }

        return {

            algo: process.env.VIDEU_AUTH_ALGO
                ? process.env.VIDEU_AUTH_ALGO
                : undefined,

            expire: process.env.VIDEU_AUTH_EXPIRE
                ? toIntSafe(process.env.VIDEU_AUTH_EXPIRE)
                : undefined,

            publicKey: process.env.VIDEU_AUTH_PUBLIC_KEY
                ? process.env.VIDEU_AUTH_PUBLIC_KEY
                : undefined,

            privateKey: process.env.VIDEU_AUTH_PRIVATE_KEY
                ? process.env.VIDEU_AUTH_PRIVATE_KEY
                : undefined,

        } as IAuthConfig;
    }

    /**
     * Generate a new EC secp256k1 key pair and write it to disk.
     * Does not alter the {@link #keyPair} property!
     *
     * @return The generated key pair in DER format.
     */
    private async generateAndStoreKeyPair(): Promise<IECKeyPairDER> {
        const keyPair = await generateECKeyPair('secp256k1');

        await Promise.all([
            asyncWriteFile(this.config.publicKey, keyPair.publicKey),
            asyncWriteFile(this.config.privateKey, keyPair.privateKey),
        ]);

        return keyPair;
    }

}
