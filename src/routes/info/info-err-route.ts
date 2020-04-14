/**
 * `/info/err` route implementation.
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

import { resolve } from 'path';

import { IAuthSubsys } from '../../../types/core/auth-subsys';
import { IStorageSubsys } from '../../../types/core/storage-subsys';
import { HTTPStatusCode } from '../../../types/json/response';
import {
    IInfoErrEndpoint,
    IInfoErrGetResponseBody
} from '../../../types/routes/info/info-err-endpoint';
import { IRequest, IResponse } from '../../../types/routes/route';

import { asyncReadDir, asyncReadFileStr } from '../../util/fs';
import { AbstractRoute } from '../abstract-route';

interface ILocaleMap {
    en: {
        [messageId: string]: string;
    };
    [locale: string]: {
        [messageId: string]: string;
    };
}

const INTL_DIR = resolve(__dirname, '..', '..', '..', 'intl');

/**
 * `/info/err` route implementation.
 */
export class InfoErrRoute extends AbstractRoute implements IInfoErrEndpoint {

    /** A map of all localized error messages. */
    private localeMessages: ILocaleMap = { en: {} };

    constructor(authSubsys: IAuthSubsys, storageSubsys: IStorageSubsys) {
        super('err', authSubsys, storageSubsys, ['info']);
    }

    /**
     * @inheritdoc
     * @override
     */
    public async init() {
        await super.init();
        await this.loadLocales();
    }

    /**
     * GET `/info/err`: Obtain all localized error messages.
     *
     * Request body: none.  The `Accept-Language` header SHOULD be present.
     *
     * Response:
     * The `Content-Language` header will be set to the locale of the messages.
     *
     * ```json
     * {
     *     "err": false,
     *     "messages": {
     *         "e_msg_0": "Error message for e_msg_0",
     *         "e_msg_1": "Error message for e_msg_1"
     *         // ...
     *     }
     * }
     * ```
     */
    public async get(req: IRequest, res: IResponse<IInfoErrGetResponseBody>) {
        res.set('Access-Control-Allow-Origin', '*');

        let locale: string = 'en';
        if (req.headers['accept-language']) {
            locale = req.headers['accept-language'];
        }
        if (locale.length < 2) {
            locale = 'en';
        }
        if (locale.length > 2) {
            locale = locale.substr(0, 2);
        }

        if (typeof this.localeMessages[locale] !== 'object') {
            locale = 'en';
        }

        res.set('Content-Language', locale);
        res.status(HTTPStatusCode.OK).json({
            err: false,
            messages: this.localeMessages[locale],
        });
    }

    /**
     * Load localized error messages from the `intl` directory.
     */
    private async loadLocales() {
        const files = await asyncReadDir(INTL_DIR);
        if (files.length === 0) {
            this.logger.w(
                'The intl directory is empty, no error messages will be sent to clients.'
            );
        }

        let enLoaded: boolean = false;

        for (const file of files) {
            if (!file.endsWith('.json')) {
                this.logger.w(
                    `File ${resolve(INTL_DIR, file)} does not have a .json extension, ignoring it`
                );
                continue;
            }

            const locale = file.split('.')[0];
            if (locale === 'en') {
                enLoaded = true;
            }

            this.logger.v(`Loading error messages for locale ${locale}`);
            const path = resolve(INTL_DIR, file);
            const contents = await asyncReadFileStr(path);
            this.localeMessages[locale] = JSON.parse(contents);
        }

        if (!enLoaded) {
            throw new Error('Error messages for fallback locale en not found');
        }
    }

}
