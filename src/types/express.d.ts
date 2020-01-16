/**
 * @file Global type extensions for express-specific types.
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

import { IUser } from './db/user';

declare global {
    namespace Express {
        interface Request {
            /**
             * Additional request data supplied from videu's master pre-hooks
             * and various middlewares.
             */
            videu: {
                /** The remote IP address. */
                clientIp: string;

                /**
                 * If the request has a *valid* authentication header, this
                 * property contains the user object.  In all other cases,
                 * it is `undefined`.  Note that this does **NOT** get injected
                 * by default, you need to inject the user login middleware
                 * manually in each route you need it.
                 *
                 * @see {@link ../../middleware/user-login}
                 */
                user?: IUser;
            };
        }
    }
}
