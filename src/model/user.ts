/**
 * Mongoose schema and model definition for the `users` table.
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

import { ObjectId } from 'bson';
import { Model, model as createModel, Schema } from 'mongoose';

import { IUser, IUserSettings } from '../../types/db/user';
import { emailRegex, userNameRegex } from '../util/regex';

/** Mongoose schema for the `settings` field in the `users` table. */
export const userSettingsSchema: Schema<IUserSettings> = new Schema<IUserSettings>({
    newsletter: {
        type: Boolean,
        default: false,
    },
    showPP: {
        type: Boolean,
        default: true,
    },
}, { _id: false });

/** Mongoose schema for the `users` table. */
export const userSchema: Schema<IUser> = new Schema<IUser>({
    _id: ObjectId,
    activationToken: String,
    dName: {
        type: String,
        default: function(this: IUser): string {
            return this.uName;
        },
    },
    email: {
        type: String,
        unique: true,
        index: true,
        validator: function(val: string): boolean {
            return emailRegex.test(val);
        },
        message: (props: any) => `${props.value} is not a valid email address`,
        required: [true, 'Email address is required'],
    },
    joined: {
        type: Date,
        default: Date.now,
    },
    lName: {
        type: String,
        index: true,
        unique: true,
        default: function(this: IUser): string {
            return this.uName.toLowerCase();
        },
    },
    passwd: String,
    settings: {
        type: userSettingsSchema,
        default: userSettingsSchema,
    },
    subCount: {
        type: Number,
        default: () => 0,
    },
    uName: {
        type: String,
        unique: true,
        validator: function(this: IUser, val: string): boolean {
            return userNameRegex.test(val);
        },
        message: (props: any) => `${props.value} is not a valid user name`,
        required: [true, 'Username is required'],
    },
    v: {
        type: Boolean,
        default: () => false,
    },
});

userSchema.methods.toPublicJSON = function() {
    return {
        id: this.id,
        displayName: this.dName,
        userName: this.uName,
        joined: this.joined.getTime(),
        subCount: this.subCount,
    };
};

userSchema.methods.toPrivateJSON = function() {
    return {
        id: this.id,
        displayName: this.dName,
        userName: this.uName,
        joined: this.joined.getTime(),
        subCount: this.subCount,

        email: this.email,
        settings: {
            newsletter: this.settings.newsletter,
            showPP: this.settings.showPP,
        },
    };
};

/** Mongoose model for the `users` database. */
export const User: Model<IUser> = createModel<IUser>('User', userSchema);
