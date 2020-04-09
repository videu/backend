/**
 * `/user/signup` route interface definition.
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

import { ISuccessResponseBody } from '../../json/response';
import { IPrivateUserJSON } from '../../json/user';
import { IPostEndpoint, IPutEndpoint } from '../route';

export interface IUserSignupPostRequestBody {
    userName?: string;
    passwd?: string;
    email?: string;
    settings?: {
        newsletter?: boolean;
        showPP?: boolean;
    };
}

export interface IUserSignupPutRequestBody {
    challenge?: string;
}

export interface IUserSignupPutResponseBody extends ISuccessResponseBody {
    token: string;
    user: IPrivateUserJSON;
}

export interface IUserSignupRoute extends
IPostEndpoint<IUserSignupPostRequestBody, ISuccessResponseBody>,
IPutEndpoint<IUserSignupPutRequestBody, IUserSignupPutResponseBody> {}
