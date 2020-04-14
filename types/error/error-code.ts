/**
 * General HTTP response interface definitions.
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

/**
 * An enumeration of all possible error message ids.
 */
export const enum ErrId {

    /** The requested user could not be found. */
    user_not_found = 'e_user_not_found',
    /** Email address is invalid. */
    user_bad_email = 'e_user_bad_email',
    /** Bad password (only when changing it, see {@linkcode .auth_bad_creds}) */
    user_bad_passwd = 'e_user_bad_passwd',
    /** Invalid user name (does not match {@linkcode userNameRegex}). */
    user_bad_user_name = 'e_user_bad_user_name',
    /** Invalid user id (does not match {@linkcode objectIdRegex}). */
    user_bad_id = 'e_user_bad_id',

    /** The supplied JSON Web Token was invalid. */
    jwt_invalid = 'e_jwt_invalid',
    /** Invalid username or password. */
    auth_bad_creds = 'e_auth_bad_creds',
    /** The `Authorization` header was malformed. */
    auth_bad_header = 'e_auth_bad_header',

    /* generic 4xx messages */
    http_400 = 'e_http_400',
    http_401 = 'e_http_401',
    http_402 = 'e_http_402',
    http_403 = 'e_http_403',
    http_404 = 'e_http_404',
    http_405 = 'e_http_405',
    http_406 = 'e_http_406',
    http_407 = 'e_http_407',
    http_408 = 'e_http_408',
    http_409 = 'e_http_409',
    http_410 = 'e_http_410',
    http_411 = 'e_http_411',
    http_412 = 'e_http_412',
    http_413 = 'e_http_413',
    http_414 = 'e_http_414',
    http_415 = 'e_http_415',
    http_416 = 'e_http_416',
    http_417 = 'e_http_417',
    http_420 = 'e_http_420',
    http_421 = 'e_http_421',
    http_422 = 'e_http_422',
    http_423 = 'e_http_423',
    http_424 = 'e_http_424',
    http_426 = 'e_http_426',
    http_428 = 'e_http_428',
    http_429 = 'e_http_429',
    http_451 = 'e_http_451',

    /* generic 5xx messages */
    http_500 = 'e_http_500',
    http_501 = 'e_http_501',
    http_502 = 'e_http_502',
    http_503 = 'e_http_503',
    http_504 = 'e_http_504',
    http_505 = 'e_http_505',
    http_506 = 'e_http_506',
    http_507 = 'e_http_507',
    http_508 = 'e_http_508',
    http_510 = 'e_http_510',
    http_511 = 'e_http_511',

}
