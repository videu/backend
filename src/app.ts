/**
 * @file The main application.
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

import { json as jsonBodyParser } from 'body-parser';
import Express from 'express';

import { ipHeaderMiddleware } from './middleware/ip-header';

import { infoRouter } from './routes/info-router';
import { userRouter } from './routes/user-router';
import { videoRouter } from './routes/video-router';

import { defaultErrReqHandler } from './error/default-error-handler';

export const app = Express();

/*
 * This middleware instantiates the `videu` property on the request object which
 * other components rely on, so we inject it right after creating the express
 * app to ensure every incoming request passes through it first before reaching
 * any other piece of our code.
 */
app.use(ipHeaderMiddleware);

app.use(jsonBodyParser({
    inflate: false,
    limit: '1kb',
    type: 'application/json',
}));

app.use('/info', infoRouter);
app.use('/user', userRouter);
app.use('/video', videoRouter);

app.use(defaultErrReqHandler);
