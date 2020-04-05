/**
 * @file Stub logger implementation.
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

import { ILogger } from '../../../types/logger';

/**
 * Stub implementation of the default logger.
 */
export class StubLogger implements ILogger {

    public d(msg: string) {
        return;
    }

    public v(msg: string) {
        return;
    }

    public i(msg: string) {
        return;
    }

    public w(msg: string) {
        return;
    }

    public e(msg: string) {
        return;
    }

    public s(msg: string) {
        return;
    }

    public wtf(msg: string) {
        return;
    }

}
