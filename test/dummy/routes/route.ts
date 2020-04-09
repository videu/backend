/**
 * Dummy implementation of category data sources.
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

import { IAuthSubsys } from '../../../types/core/auth-subsys';
import { LifecycleState } from '../../../types/core/lifecycle';
import { IStorageSubsys } from '../../../types/core/storage-subsys';
import { HTTPStatusCode } from '../../../types/json/response';
import { IRequest, IResponse } from '../../../types/routes/route';

import { BackendError } from '../../../src/error/backend-error';
import { AbstractRoute } from '../../../src/routes/abstract-route';

import { StubAuthSubsys } from '../core/auth-subsys';
import { StubMongoSubsys } from '../core/mongo-subsys';
import { StubStorageSubsys } from '../core/storage-subsys';

export class EmptyRoute extends AbstractRoute {

    public authSubsys: IAuthSubsys;

    public storageSubsys: IStorageSubsys;

    constructor(authSubsys: IAuthSubsys = new StubAuthSubsys(),
                storageSubsys: IStorageSubsys = new StubStorageSubsys()) {
        super('test', authSubsys, storageSubsys);

        this.authSubsys = authSubsys;
        this.storageSubsys = storageSubsys;
    }

}

export class StubRoute extends AbstractRoute {

    public authSubsys: IAuthSubsys;
    public storageSubsys: IStorageSubsys;

    public shouldFail = {
        get: false,
        post: false,
        put: false,
        delete: false,
        patch: false,
    };

    private mongoSubsys?: StubMongoSubsys;

    constructor(authSubsys: IAuthSubsys = new StubAuthSubsys(),
                storageSubsys: IStorageSubsys = new StubStorageSubsys()) {
        super('test', authSubsys, storageSubsys);

        this.authSubsys = authSubsys;
        this.storageSubsys = storageSubsys;
    }

    public async get(req: IRequest<any>, res: IResponse<any>) {
        if (this.shouldFail.get) {
            throw new BackendError('GET failed');
        }
        res.status(HTTPStatusCode.OK).json({ err: false });
    }

    public async post(req: IRequest<any>, res: IResponse<any>) {
        if (this.shouldFail.post) {
            throw new BackendError('POST failed');
        }
        res.status(HTTPStatusCode.OK).json({ err: false });
    }

    public async put(req: IRequest<any>, res: IResponse<any>) {
        if (this.shouldFail.put) {
            throw new BackendError('PUT failed');
        }
        res.status(HTTPStatusCode.OK).json({ err: false });
    }

    public async delete(req: IRequest<any>, res: IResponse<any>) {
        if (this.shouldFail.delete) {
            throw new BackendError('DELETE failed');
        }
        res.status(HTTPStatusCode.OK).json({ err: false });
    }

    public async patch(req: IRequest<any>, res: IResponse<any>) {
        if (this.shouldFail.patch) {
            throw new BackendError('PATCH failed');
        }
        res.status(HTTPStatusCode.OK).json({ err: false });
    }

    public async init() {
        super.init();

        if (this.storageSubsys.state === LifecycleState.CREATED) {
            const mongoSubsys = new StubMongoSubsys();
            await mongoSubsys.init();
            this.storageSubsys.init(mongoSubsys);
        }
        if (this.authSubsys.state === LifecycleState.CREATED) {
            await this.authSubsys.init(this.storageSubsys);
        }
    }

    public async exit() {
        await super.exit();

        if (this.mongoSubsys) {
            await this.mongoSubsys.exit();
        }
    }

}
