/**
 * @file Dummy data provider for various user objects.
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

import { ObjectId } from 'mongodb';

import { User } from '../../../src/model/user';
import { IUser } from '../../../types/db/user';

export const DUMMY_USERS: IUser[] = [
    new User({
        _id: new ObjectId(),
        dName: 'John Doe',
        email: 'john@example.com',
        joined: new Date(Date.now() - 3600 * 24),
        lName: 'johndoe',
        passwd: '$2b$12$bm.Btr6lkmGXERDyCQ3eHuEKaWDM70n8ih775mS.FlkTYSNtlh9ka',
        settings: {
            newsletter: true,
            showPP: true,
        },
        subCount: 5,
        uName: 'JohnDoe',
    }),
    new User({
        _id: new ObjectId(),
        dName: 'Alice',
        email: 'alice@test.net',
        joined: new Date(Date.now() - 3600 * 24),
        lName: 'alice',
        passwd: '$2b$12$IHQ2R0wjtbRyOCMqi79G7efIfufssR/0z.tXxAm8l8zRDrPuobObe',
        settings: {
            newsletter: false,
            showPP: true,
        },
        subCount: 2,
        uName: 'alice',
    }),
    new User({
        _id: new ObjectId(),
        dName: 'Bob',
        email: 'bot@test.vnet',
        joined: new Date(Date.now() - 3600 * 24),
        lName: 'xxb0bxx',
        passwd: '$2b$12$TLe6vV.iFwlySozsAm8LouxVUsHMoA1wqWiDmKbKv5e0fp2PrHj7y',
        settings: {
            newsletter: false,
            showPP: true,
        },
        subCount: 0,
        uName: 'xXb0bXx',
    }),
];
