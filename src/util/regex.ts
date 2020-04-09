/**
 * A collection of various regular expressions.
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

/** A regular expression for validating email addresses. */
export const emailRegex: RegExp =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/** Regular expression for testing if a string is a decimal number. */
export const decNumberRegex: RegExp = /^(0|(-?(([1-9]\d*(\.\d+)?)|(0\.\d*[1-9]\d*))))(e[+-]?\d+)?$/;

export const hexNumberRegex: RegExp = /^0x[0-9a-fA-F]+$/;

export const octNumberRegex: RegExp = /^0[0-7]+$/;

export const binNumberRegex: RegExp = /^1[01]*$/;

/** A regular expression for validating user names. */
export const userNameRegex: RegExp = /^[a-zA-Z0-9_]{2,16}$/;

/**
 * A regular expression for validating MongoDB Object IDs.
 *
 * Even though Object IDs may use uppercase characters as well, it deliberately
 * does not match them because the videu specification does not allow uppercase
 * letters in IDs.
 */
export const objectIdRegex: RegExp = /^[a-f0-9]{24}$/;

/** A regualr expression validating JSON web tokens w/ signature. */
export const jwtRegex: RegExp =
    /^[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/;
