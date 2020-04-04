/**
 * @file Main init routine.
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

/* tslint:disable: no-console */

import { IVideu } from '../types/core/videu';

import { Videu } from './core/videu';

/** The main app instance. */
let videu: IVideu | null = null;

/**
 * The application's main initialization routine.
 * Executed when the node proccess starts.
 */
export async function doInit() {
    try {
        videu = new Videu();
        await videu.init();
        process.on('SIGINT', async function() {
            console.log('SIGINT caught, exiting');
            await doExit();
        });
    } catch (err) {
        console.error(err);
        doExit();
        process.exit(1);
    }
}

/**
 * The application's top-level exit routine.
 * Executed when a SIGINT or a critical error is encountered.
 */
export async function doExit() {
    if (videu !== null) {
        await videu.exit();
    }
}
