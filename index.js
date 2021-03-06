#!/usr/bin/env node

/**
 * Early bootstrap routine for loading the application.
 * @packageDocumentation
 *
 * Note about how videu is started:
 * Configuration parsing is done in plain JavaScript.  The reason for this is
 * that most properties in the `gloval.videu` type definition are declared
 * `readonly` (see `src/types/global.d.ts` for details and the reason why).
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

'use strict';

require('dotenv').config();

const semver = require('semver');

switch (process.env.NODE_ENV) {
case 'development':
case 'production':
    break;
default:
    console.error(
        'The NODE_ENV environment variable must be set to either '
        + '"production" or "development".  Exiting.'
    );
    process.exit(1);
}

function _parseVersion(version) {
    if (typeof version !== 'string') {
        throw new TypeError(
            `Expected "version" to be of type "string", got "${typeof version}" instead`
        );
    }

    if (!semver.valid(version)) {
        throw new EvalError(
            `Invalid version: "${version}" does not conform to the semver format`
        );
    }

    return {
        versionString: version,
        major: semver.major(version),
        minor: semver.minor(version),
        patch: semver.patch(version),
        tags: semver.prerelease(version) || []
    };
}

global.videu = {
    logLevel: 0, // will be parsed in TypeScript
    appName: process.env.VIDEU_APP_NAME || 'videu',
    instanceId: process.env.VIDEU_INSTANCE_ID || 'default',
    jwt: {},
};

try {
    global.videu.version = _parseVersion(require('./package.json').version);
} catch (err) {
    console.error(err);
    process.exit(1);
}

console.log(
    'Starting the \x1b[1mvideu backend\x1b[0m version \x1b[1m'
    + global.videu.version.versionString
    + `\x1b[0m in \x1b[1m${process.env.NODE_ENV}\x1b[0m mode`
);

if (process.env._VIDEU_LOADED !== 'true') {
    try {
        require('./build/bootstrap');
    } catch (err) {
        console.error(
            'Could not load the application bootstrapper, did you forget to run `npm build`?'
        );
    }
}
