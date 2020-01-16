/**
 * @file Mongoose bootstrapper.
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

import mongoose from 'mongoose';

import { ILogger } from '../types/logger';
import { Logger } from '../util/logger';
import { validateMongoConfig } from '../util/validate-config';

const log: ILogger = new Logger('Mongo');

if (!validateMongoConfig()) {
    log.i('Exiting due to fatal error');
    process.exitCode = 1;
    process.exit();
}

const mongooseOpts: any = {
    dbName: global.videu.mongo.db,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: global.videu.mongo.ssl,
};

if (typeof global.videu.mongo.authSource === 'string') {
    mongooseOpts.authSource = global.videu.mongo.authSource;
    mongooseOpts.auth = {
        user: global.videu.mongo.user,
        password: global.videu.mongo.passwd,
    };
}

mongoose.set('useCreateIndex', true);
mongoose.connect(
    `mongodb://${global.videu.mongo.host}:${global.videu.mongo.port}`,
    mongooseOpts
);
