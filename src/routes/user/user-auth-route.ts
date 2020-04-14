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

import { IAuthSubsys } from '../../../types/core/auth-subsys';
import { IStorageSubsys } from '../../../types/core/storage-subsys';
import { IUserRepository } from '../../../types/data/repository/user';
import { ErrId } from '../../../types/error/error-code';
import { HTTPStatusCode } from '../../../types/json/response';
import { IRequest, IResponse } from '../../../types/routes/route';
import {
    IUserAuthPostRequestBody,
    IUserAuthResponseBody,
    IUserAuthRoute,
} from '../../../types/routes/user/user-auth-endpoint';

import { AuthError } from '../../error/auth-error';
import { BackendError } from '../../error/backend-error';
import { userLogin } from '../../middleware/user-login';
import { middleware } from '../../util/decorators/middleware';
import { passwdVerify } from '../../util/passwd-hasher';
import { userNameRegex } from '../../util/regex';
import { AbstractRoute } from '../abstract-route';

/**
 * `/user/auth` route implementation.
 */
export class UserAuthRoute extends AbstractRoute implements IUserAuthRoute {

    private readonly userRepo: IUserRepository;

    constructor(authSubsys: IAuthSubsys, storageSubsys: IStorageSubsys) {
        super('auth', authSubsys, storageSubsys, ['user']);

        this.userRepo = storageSubsys.userRepo;
    }

    /**
     * GET `/user/auth`: Check if a JWT is considered valid.
     *
     * Requires the `Authorization` HTTP request header set according to the
     * specification.  No request body.
     *
     * Response on success: HTTP/200 OK
     *
     * ```json
     * {
     *     "err": false,
     *     "token": "<JWT from the auth header>",
     *     "user": {
     *         // Private user data
     *     }
     * }
     * ```
     *
     * Response body on failure: HTTP/200 OK
     *
     * ```json
     * {
     *     "err": true,
     *     "msg": "e_jwt_invalid",
     * }
     * ```
     */
    @middleware(userLogin, { soft: true })
    public async get(req: IRequest, res: IResponse<IUserAuthResponseBody>) {
        res.status(HTTPStatusCode.OK);

        if (req.videu ! .auth) {
            res.json({
                err: false,
                token: req.videu ! .auth.token,
                user: req.videu ! .auth.user.toPrivateJSON(),
            });
        } else {
            res.json({
                err: true,
                msg: ErrId.jwt_invalid,
            });
        }
    }

    /**
     * POST `/user/auth`: Obtain a JSON Web Token
     *
     * Request body:
     *
     * ```json
     * {
     *     "userName": "<userName>", // w/out the @
     *     "passwd": "<password in clear text>"
     * }
     * ```
     *
     * Response on success: HTTP/200 OK
     *
     * ```json
     * {
     *     "err": false,
     *     "token": "<The JWT>",
     *     "user": {
     *         // Private user data
     *     }
     * }
     * ```
     *
     * Response on auth failure: HTTP/401 Unauthorized
     *
     * ```json
     * {
     *     "err": true,
     *     "msg": "e_invalid_username_or_passwd"
     * }
     * ```
     */
    public async post(req: IRequest<IUserAuthPostRequestBody>,
                      res: IResponse<IUserAuthResponseBody>) {
        if (typeof req.body !== 'object') {
            throw new BackendError(ErrId.http_400, HTTPStatusCode.BAD_REQUEST);
        }

        const userName = req.body.userName;
        if (typeof userName !== 'string' || !userNameRegex.test(userName)) {
            throw new AuthError(ErrId.auth_bad_creds);
        }

        const passwd = req.body.passwd;
        if (typeof passwd !== 'string') {
            throw new AuthError(ErrId.auth_bad_creds);
        }

        const user = await this.userRepo.getByUserName(userName);
        if (user === null) {
            throw new AuthError(ErrId.auth_bad_creds);
        }

        if (await passwdVerify(passwd, user.passwd) !== true) {
            throw new AuthError(ErrId.auth_bad_creds);
        }

        res.status(HTTPStatusCode.OK).json({
            err: false,
            token: await this.authSubsys.sign(user),
            user: user.toPrivateJSON(),
        });
    }

}
