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
import {
    generateECKeyPair,
    IECKeyPairPEM,
    readECKeyPairFromFilesUnchecked,
} from '../util/ec';
import { asyncWriteFileStr, canStat } from '../util/fs';
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

    /** The key pair in PEM format. */
    private keyPair: IECKeyPairPEM | null = null;

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
                    reject(new AuthError(err.message));
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

        const publicKeyExists = await canStat(this.config.publicKeyFile);
        const privateKeyExists = await canStat(this.config.privateKeyFile);

        if (publicKeyExists && privateKeyExists) {

            this.keyPair = await readECKeyPairFromFilesUnchecked(
                this.config.publicKeyFile,
                this.config.privateKeyFile
            );

        } else if (!publicKeyExists && !privateKeyExists) {

            if (process.env.NODE_ENV === 'development') {
                this.logger.i('Signing key not found, generating one for you');
                this.keyPair = await this.generateAndStoreKeyPair();
                this.logger.i(
                    `Written public key to ${this.config.publicKeyFile}, `
                    + `private key to ${this.config.privateKeyFile}`
                );
            } else {
                throw new InvalidConfigError('Public and private key files do not exist');
            }

        } else {

            if (publicKeyExists) {
                throw new InvalidConfigError(
                    `Public key "${this.config.publicKeyFile}" exists, `
                    + `but private key "${this.config.privateKeyFile}" doesn't`
                );
            } else {
                throw new InvalidConfigError(
                    `Private key "${this.config.privateKeyFile}" exists, `
                    + `but public key "${this.config.publicKeyFile}" doesn't`
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

            publicKeyFile: process.env.VIDEU_AUTH_PUBLIC_KEY_FILE
                ? process.env.VIDEU_AUTH_PUBLIC_KEY_FILE
                : undefined,

            privateKeyFile: process.env.VIDEU_AUTH_PRIVATE_KEY_FILE
                ? process.env.VIDEU_AUTH_PRIVATE_KEY_FILE
                : undefined,

        } as IAuthConfig;
    }

    /**
     * Generate a new EC secp256k1 key pair and write it to disk.
     * Does not alter the {@link #keyPair} property!
     *
     * @return The generated key pair in DER format.
     */
    private async generateAndStoreKeyPair(): Promise<IECKeyPairPEM> {
        const keyPair = await generateECKeyPair('secp256k1');

        await Promise.all([
            asyncWriteFileStr(this.config.publicKeyFile, keyPair.publicKey),
            asyncWriteFileStr(this.config.privateKeyFile, keyPair.privateKey),
        ]);

        return keyPair;
    }

}
