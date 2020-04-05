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

import mongoose, { ConnectionOptions as MongooseConnectionOptions, Mongoose } from 'mongoose';

import {
    IMongoConfig,
    IMongoSubsys,
    MONGO_SUBSYS_CONFIG_SCHEMA,
} from '../../types/core/mongo-subsys';
import { ICategoryDataAuthority } from '../../types/data/data-source/category';
import { IUserDataAuthority } from '../../types/data/data-source/user';
import { IVideoDataAuthority } from '../../types/data/data-source/video';

import { MongoCategoryDataSource } from '../data/data-source/category/mongo';
import { MongoUserDataSource } from '../data/data-source/user/mongo';
import { MongoVideoDataSource } from '../data/data-source/video/mongo';
import { InvalidConfigError } from '../error/invalid-config-error';
import { toBoolSafe, toIntSafe } from '../util/conversions';
import { AbstractSubsysConfigurable } from './abstract-subsys';

/**
 * MongoDB subsystem implementation.
 */
export class MongoSubsys
extends AbstractSubsysConfigurable<IMongoConfig>
implements IMongoSubsys {

    /** @inheritdoc */
    public readonly categoryDataAuthority: ICategoryDataAuthority;

    /** @inheritdoc */
    public readonly userDataAuthority: IUserDataAuthority;

    /** @inheritdoc */
    public readonly videoDataAuthority: IVideoDataAuthority;

    /** The mongoose connection instance. */
    protected mongooseInstance: Mongoose | null = null;

    /**
     * Instantiate the Mongo Subsystem (there should only really exist one
     * instance of this class at any time).
     *
     * @param config The optional configuration object.  If left out, the config
     *     will be parsed from environment variables.
     */
    constructor(config: IMongoConfig | null = null) {
        super('mongo', config, MONGO_SUBSYS_CONFIG_SCHEMA);

        this.categoryDataAuthority = new MongoCategoryDataSource();
        this.userDataAuthority = new MongoUserDataSource();
        this.videoDataAuthority = new MongoVideoDataSource();
    }

    /**
     * @inheritdoc
     * @override
     */
    public async onInit() {
        await super.onInit();

        if (process.env.NODE_ENV === 'production' && !this.config.ssl) {
            throw new InvalidConfigError(
                'NODE_ENV is "production", but SSL is disabled. Refusing to start.'
            );
        }

        const opts: MongooseConnectionOptions = {
            dbName: this.config.db,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: this.config.ssl,
        };

        if (this.config.userName && this.config.passwd) {
            opts.authSource = this.config.authSource;
            opts.auth = {
                user: this.config.userName,
                password: this.config.passwd,
            };
        } else {
            this.logger.w('Authentication is disabled');
        }

        const uri = `mongodb://${this.config.host}:${this.config.port}`;
        this.logger.v(`Connecting to ${uri}`);

        mongoose.set('useCreateIndex', true);
        this.mongooseInstance = await mongoose.connect(uri, opts);
        this.logger.v('Connection established successfully');
    }

    /**
     * @inheritdoc
     * @override
     */
    public async onExit() {
        if (this.mongooseInstance !== null) {
            this.logger.v('Disconnecting');
            await this.mongooseInstance.disconnect();
            this.logger.v('Disconnected successfully');
        }
    }

    /**
     * @inheritdoc
     * @override
     */
    protected readConfigFromEnv(): IMongoConfig {
        return {
            host: process.env.VIDEU_MONGO_HOST
                ? process.env.VIDEU_MONGO_HOST
                : undefined,

            port: process.env.VIDEU_MONGO_PORT
                ? toIntSafe(process.env.VIDEU_MONGO_PORT)
                : undefined,

            db: process.env.VIDEU_MONGO_DB
                ? process.env.VIDEU_MONGO_DB
                : undefined,

            ssl: process.env.VIDEU_MONGO_SSL
                ? toBoolSafe(process.env.VIDEU_MONGO_SSL)
                : undefined,

            authSource: process.env.VIDEU_MONGO_AUTH_SOURCE
                ? process.env.VIDEU_MONGO_AUTH_SOURCE
                : undefined,

            userName: process.env.VIDEU_MONGO_USER_NAME
                ? process.env.VIDEU_MONGO_USER_NAME
                : undefined,

            passwd: process.env.VIDEU_MONGO_PASSWD
                ? process.env.VIDEU_MONGO_PASSWD
                : undefined,
        } as IMongoConfig;
    }

}
