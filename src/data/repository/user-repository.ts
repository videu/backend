/**
 * @file The user repository.
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

import { ObjectId } from 'mongodb';

import {
    IMinimalUserData,
    IUserDataAuthority,
    IUserDataCache,
} from '../../../types/data/data-source/user';
import { IUserRepository } from '../../../types/data/repository/user';
import { IUser } from '../../../types/db/user';
import { ILogger } from '../../../types/logger';

import { MongoUserDataSource } from '../../data/data-source/user/mongo';
import { ConflictError } from '../../error/conflict-error';
import { Logger } from '../../util/logger';
import { AbstractRepository } from './abstract-repository';

/**
 * The user repository.
 */
export class UserRepository
extends AbstractRepository<IUser, IMinimalUserData, IUserDataAuthority, IUserDataCache>
implements IUserRepository {

    /** @inheritdoc */
    public readonly authority: IUserDataAuthority;

    /** @inheritdoc */
    protected caches: IUserDataCache[] = [];

    constructor(logger: ILogger, authority: IUserDataAuthority) {
        super(logger);

        this.authority = authority;
    }

    /**
     * DO NOT CALL THIS METHOD.
     * This method does not check if there already is a user with the email or
     * user name of the new user, and will just throw some mongoose-internal
     * if there is.
     *
     * @inheritdoc
     * @override
     */
    public async create(data: IMinimalUserData): Promise<IUser> {
        throw new Error('Don\'t use create() on the user repository, call register() instead');
    }

    /** @inheritdoc */
    public async getByEmail(email: string): Promise<IUser | null> {
        for (const ds of this.caches) {
            const hit = await ds.getByEmail(email);
            if (hit !== null) {
                return hit;
            }
        }

        const finalHit = await this.authority.getByEmail(email);
        if (finalHit !== null) {
            const promises: Array<Promise<void>> = [];
            for (const cache of this.caches) {
                promises.push(cache.put(finalHit));
            }
            try {
                await Promise.all(promises);
            } catch (err) {
                this.logger.e('Caching error', err);
            }
        }

        return finalHit;
    }

    /** @inheritdoc */
    public async getById(id: ObjectId): Promise<IUser | null> {
        for (const cache of this.caches) {
            const hit = await cache.getById(id);
            if (hit !== null) {
                return hit;
            }
        }

        const finalHit = await this.authority.getById(id);
        if (finalHit !== null) {
            const promises: Array<Promise<void>> = [];
            for (const cache of this.caches) {
                promises.push(cache.put(finalHit));
            }
            try {
                await Promise.all(promises);
            } catch (err) {
                this.logger.e('Caching error', err);
            }
        }

        return finalHit;
    }

    /** @inheritdoc */
    public async getByUserName(userName: string): Promise<IUser | null> {
        for (const ds of this.caches) {
            const hit = await ds.getByUserName(userName);
            if (hit !== null) {
                return hit;
            }
        }

        const finalHit = await this.authority.getByUserName(userName);
        if (finalHit !== null) {
            const promises: Array<Promise<void>> = [];
            for (const cache of this.caches) {
                promises.push(cache.put(finalHit));
            }
            try {
                await Promise.all(promises);
            } catch (err) {
                this.logger.e('Caching error', err);
            }
        }

        return finalHit;
    }

    /** @inheritdoc */
    public async register(userData: IMinimalUserData): Promise<IUser> {
        const collidingUser =
            await this.authority.findCollidingUser(userData.uName, userData.email);

        if (collidingUser !== null) {
            if (userData.email === collidingUser.email) {
                throw new ConflictError('Email already exists');
            } else {
                throw new ConflictError('Username already exists');
            }
        }

        const user = await this.authority.create(userData);

        const promises: Array<Promise<void>> = [];
        for (const cache of this.caches) {
            promises.push(cache.put(user));
        }
        try {
            await Promise.all(promises);
        } catch (err) {
            this.logger.e('Cache store error', err);
        }

        return user;
    }

}

/* TODO: Just implement the route subsystem so this gets obsolete ffs */
export const userRepo = new UserRepository(new Logger('deprecated'), new MongoUserDataSource());
