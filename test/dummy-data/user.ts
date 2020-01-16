import { ObjectId } from 'mongodb';
import { User } from '../../src/model/user';
import { IUser } from '../../src/types/db/user';

export const demoUsers: IUser[] = [
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
            showPP: false,
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
        subCount: 2,
        uName: 'xXb0bXx',
    }),
];
