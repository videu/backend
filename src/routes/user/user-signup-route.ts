/**
 * `/user` route implementation.
 * @packageDocumentation
 *
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

import randomstring from 'randomstring';

import { IAuthSubsys } from '../../../types/core/auth-subsys';
import { IStorageSubsys } from '../../../types/core/storage-subsys';
import { IUserRepository } from '../../../types/data/repository/user';
import { HTTPStatusCode, ISuccessResponseBody } from '../../../types/json/response';
import { IRequest, IResponse } from '../../../types/routes/route';
import {
    IUserSignupPostRequestBody,
    IUserSignupPutRequestBody,
    IUserSignupPutResponseBody,
    IUserSignupRoute,
} from '../../../types/routes/user/user-signup-endpoint';

import { BackendError } from '../../error/backend-error';
import { passwdHash } from '../../util/passwd-hasher';
import { emailRegex, userNameRegex } from '../../util/regex';
import { AbstractRoute } from '../abstract-route';

/**
 * `/user/signup` route implementation.
 */
export class UserSignupRoute extends AbstractRoute implements IUserSignupRoute {

    private readonly userRepo: IUserRepository;

    constructor(authSubsys: IAuthSubsys, storageSubsys: IStorageSubsys) {
        super('signup', authSubsys, storageSubsys, ['user']);

        this.userRepo = storageSubsys.userRepo;
    }

    /**
     * POST `/user/signup`: Register a new user account.
     *
     * Request body:
     *
     * ```json
     * {
     *     "userName": "<3-16 alphanumeric chars and underscores>",
     *     "passwd": "<password, min. 8 characters>",
     *     "email": "<the email>",
     *     "settings": {
     *         "newsletter": false,
     *         "showPP": false,
     *     }
     * }
     * ```
     *
     * Response on success: HTTP/201 Created.  An email will be sent to the
     * specified email address containing a challenge token.  If this token is
     * sent to `PUT /user/signup`, the account is activated.  Accounts not
     * activated within 12 hours are deleted again automatically.
     *
     * ```json
     * {
     *     "err": false
     * }
     * ```
     *
     * Response if username / password are already taken: HTTP/409 Conflict
     *
     * ```json
     * {
     *     "err": true,
     *     "msg": "<an error message>"
     * }
     * ```
     */
    public async post(req: IRequest<IUserSignupPostRequestBody>,
                      res: IResponse<ISuccessResponseBody>) {
        if (typeof req.body !== 'object') {
            throw new BackendError('No data sent', HTTPStatusCode.BAD_REQUEST);
        }
        const body = req.body;

        if (typeof body.userName !== 'string' || !userNameRegex.test(body.userName)) {
            throw new BackendError('Invalid user name', HTTPStatusCode.BAD_REQUEST);
        }
        if (typeof body.passwd !== 'string') {
            throw new BackendError('No password sent', HTTPStatusCode.BAD_REQUEST);
        }
        if (typeof body.settings !== 'object') {
            throw new BackendError('No settings sent', HTTPStatusCode.BAD_REQUEST);
        }
        if (typeof body.settings.newsletter !== 'boolean') {
            throw new BackendError('No Newsletter setting specified', HTTPStatusCode.BAD_REQUEST);
        }
        if (typeof body.settings.showPP !== 'boolean') {
            throw new BackendError(
                'No profile picture visibility setting specified',
                HTTPStatusCode.BAD_REQUEST
            );
        }
        if (typeof body.email !== 'string' || !emailRegex.test(body.email)) {
            throw new BackendError('Invalid email', HTTPStatusCode.BAD_REQUEST);
        }

        await this.userRepo.register({
            uName: body.userName,
            email: body.email,
            passwd: await passwdHash(body.passwd),
            activationToken: randomstring.generate(64),
            settings: {
                newsletter: body.settings.newsletter,
                showPP: body.settings.showPP,
            },
        });

        res.status(HTTPStatusCode.CREATED).json({ err: false });
        return;
    }

    /**
     * PUT `/user/signup`: Activate a user account.
     *
     * Request body:
     *
     * ```json
     * {
     *     "challenge": "<64-char alphanumeric string sent by email>"
     * }
     * ```
     *
     * Response on success: HTTP/200 OK
     *
     * ```json
     * {
     *     "err": false,
     *     "token": "<signed JWT>",
     *     "user": {
     *         // Private user data
     *     }
     * }
     * ```
     *
     * Response on error: HTTP/400 Bad Request
     *
     * ```json
     * {
     *     "err": true,
     *     "msg": "<error message>"
     * }
     * ```
     */
    public async put(req: IRequest<IUserSignupPutRequestBody>,
                     res: IResponse<IUserSignupPutResponseBody>) {
        if (typeof req.body !== 'object') {
            throw new BackendError('No data sent', HTTPStatusCode.BAD_REQUEST);
        }
        if (typeof req.body.challenge !== 'string') {
            throw new BackendError('No challenge token sent', HTTPStatusCode.BAD_REQUEST);
        }

        const user = await this.userRepo.activate(req.body.challenge);
        const token = await this.authSubsys.sign(user);

        res.status(HTTPStatusCode.OK).json({
            err: false,
            token: token,
            user: user.toPrivateJSON(),
        });
    }

}
