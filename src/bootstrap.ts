/**
 * @file The main application loader.
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

import '../types/global';
import { banner } from './util/banner';

process.env._VIDEU_LOADED = 'true';

/*
 * Ensure that index.js has been executed before doing anything else.
 * This might not be the case if the server is started with npm run-script dev.
 */
if (typeof global.videu === 'undefined') {
    /* tslint:disable-next-line:no-var-requires */
    require('../index.js');
}

import { ILogger } from '../types/logger';
import { Logger, parseLogLevel } from './util/logger';

const log: ILogger = new Logger('Core');

global.videu.logLevel =
    parseLogLevel(process.env.VIDEU_LOG_LEVEL || 'info') || Logger.LEVEL_INFO;

import { doInit } from './init';

/* TODO: Make this file obsolete and move this call to ../index.js */
doInit();

if (banner !== null) {
    log.i(banner);
}
