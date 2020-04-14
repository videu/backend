/**
 * `/user` route implementation.
 * @packageDocumentation
 *
 * @author Felix Kopp <sandtler@sandtler.club>
 *
 * The `/info` route is just for general information on the backend server.
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

import { IAuthSubsys } from '../../../types/core/auth-subsys';
import { IStorageSubsys } from '../../../types/core/storage-subsys';
import { IUserRepository } from '../../../types/data/repository/user';
import { HTTPStatusCode } from '../../../types/json/response';
import { IRequest, IResponse } from '../../../types/routes/route';
import {
    IUserEndpoint,
    IUserGetRequestBody,
    IUserGetResponseBody,
} from '../../../types/routes/user/user-endpoint';

import { IUser } from '../../../types/db/user';
import { BackendError } from '../../error/backend-error';
import { userLogin } from '../../middleware/user-login';
import { middleware } from '../../util/decorators/middleware';
import { objectIdRegex, userNameRegex } from '../../util/regex';
import { AbstractRoute } from '../abstract-route';
import { UserAuthRoute } from './user-auth-route';
import { UserSignupRoute } from './user-signup-route';

/**
 * `/user` route implementation.
 */
export class UserRoute extends AbstractRoute implements IUserEndpoint {

    private readonly userRepo: IUserRepository;

    constructor(authSubsys: IAuthSubsys, storageSubsys: IStorageSubsys) {
        super('user', authSubsys, storageSubsys);

        this.userRepo = storageSubsys.userRepo;

        const userAuthRoute = new UserAuthRoute(authSubsys, storageSubsys);
        const userSignupRoute = new UserSignupRoute(authSubsys, storageSubsys);
        this.children.set(userAuthRoute.name, userAuthRoute);
        this.children.set(userSignupRoute.name, userSignupRoute);
    }

    /**
     * GET `/user`: Obtain information on a single user
     *
     * If the HTTP `Authorization` header is set in the reuest body and the
     * requested user is the one the JWT was issued to, the response includes
     * private user data.  In all other cases, it only includes public data.
     *
     * Request body:
     *
     * ```json
     * {
     *     // Either one of these two may be specified
     *     "id": "<the unique user id>",
     *     "userName": "<user name>" // w/out the @
     * }
     * ```
     *
     * Response on success: HTTP/200 OK
     *
     * ```json
     * {
     *     "err": false,
     *     "user": {
     *         // Private or public user data, see above
     *     }
     * }
     * ```
     *
     * Response on error: HTTP/404 Not found
     *
     * ```json
     * {
     *     "err": true,
     *     "msg": "User does not exist"
     * }
     * ```
     */
    @middleware(userLogin, { soft: false })
    public async get(req: IRequest<IUserGetRequestBody>,
                     res: IResponse<IUserGetResponseBody>) {
        const body: IUserGetRequestBody = req.body;
        let user: IUser | null = null;

        if (typeof body !== 'object') {
            throw new BackendError('No data sent', HTTPStatusCode.BAD_REQUEST);
        }

        if (typeof body.id === 'string') {
            if (!objectIdRegex.test(body.id)) {
                throw new BackendError('Invalid user id', HTTPStatusCode.BAD_REQUEST);
            }

            user = await this.userRepo.getById(new ObjectId(body.id));
        } else if (typeof body.userName === 'string') {
            if (!userNameRegex.test(body.userName)) {
                throw new BackendError('User does not exist', HTTPStatusCode.NOT_FOUND);
            }

            user = await this.userRepo.getByUserName(body.userName);
        }

        if (user === null) {
            throw new BackendError('User does not exist', HTTPStatusCode.NOT_FOUND);
        }

        if (req.videu ! .auth && req.videu ! .auth.user.id === user.id) {
            res.status(HTTPStatusCode.OK).json({
                err: false,
                user: user.toPrivateJSON(),
            });
        } else {
            res.status(HTTPStatusCode.OK).json({
                err: false,
                user: user.toPublicJSON(),
            });
        }
    }

}
