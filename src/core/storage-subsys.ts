/**
 * @file Storage subsystem implementation.
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

import { IMongoSubsys } from '../../types/core/mongo-subsys';
import { IStorageSubsys } from '../../types/core/storage-subsys';
import { ICategoryRepository } from '../../types/data/repository/category';
import { IUserRepository } from '../../types/data/repository/user';
import { IVideoRepository } from '../../types/data/repository/video';

import { CategoryRepository } from '../data/repository/category-repository';
import { UserRepository } from '../data/repository/user-repository';
import { VideoRepository } from '../data/repository/video-repository';
import { IllegalAccessError } from '../error/illegal-access-error';
import { AbstractSubsys } from './abstract-subsys';

/**
 * The storage subsystem.
 * Takes care of instantiating the Repositories and adding DataSources to them.
 */
export class StorageSubsys extends AbstractSubsys<[IMongoSubsys]> implements IStorageSubsys {

    /** @inheritdoc */
    private _categoryRepo: ICategoryRepository | null = null;

    /** @inheritdoc */
    private _userRepo: IUserRepository | null = null;

    /** @inheritdoc */
    private _videoRepo: IVideoRepository | null = null;

    /**
     * Create the storage subsystem (there should only really be one instance of
     * this class at any point in time).
     */
    constructor() {
        super('storage');
    }

    /** @inheritdoc */
    public get categoryRepo(): ICategoryRepository {
        if (this._categoryRepo === null) {
            throw new IllegalAccessError(
                'Cannot access repository before subsystem initialization'
            );
        }

        return this._categoryRepo;
    }

    /** @inheritdoc */
    public get userRepo(): IUserRepository {
        if (this._userRepo === null) {
            throw new IllegalAccessError(
                'Cannot access repository before subsystem initialization'
            );
        }

        return this._userRepo;
    }

    /** @inheritdoc */
    public get videoRepo(): IVideoRepository {
        if (this._videoRepo === null) {
            throw new IllegalAccessError(
                'Cannot access repository before subsystem initialization'
            );
        }

        return this._videoRepo;
    }

    /**
     * @inheritdoc
     * @override
     */
    public async onInit(mongoSubsys: IMongoSubsys): Promise<void> {
        this._categoryRepo = new CategoryRepository(this.logger, mongoSubsys.categoryDataAuthority);
        this._userRepo = new UserRepository(this.logger, mongoSubsys.userDataAuthority);
        this._videoRepo = new VideoRepository(this.logger, mongoSubsys.videoDataAuthority);
    }

    /**
     * @inheritdoc
     * @override
     */
    public async onExit() {
        this._categoryRepo = null;
        this._userRepo = null;
        this._videoRepo = null;
    }

}
