/**
 * @file Dummy JWT key pair provider for unit tests.
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

if (process.env.NODE_ENV !== 'development') {
    /* Just a little backup in case someone comes up with a *really* stupid idea */
    throw new Error(
        'Please, FOR THE LOVE OF GOD, DO NOT use this key in production environments.'
    );
}

/**
 * **NEVER USE THIS KEY FOR ANYTHING ELSE THAN RUNNING UNIT TESTS.**
 * **ITS PRIVATE KEY IS PUBLICLY AVAILABLE ON THE GIT REPOSITORY.**
 *
 * A dummy `secp256k1` key pair for unit testing.  **ONLY** for unit testing.
 * We need to always use the same key because that is the only practical way we
 * can reliably tell if JWTs have been issued correctly in automated tests.
 */
export const unsafeTestKeyPair: string =
`-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIMWgaggFW35j+zO0SYKkDM5iCMAN2mZBhZFYWBHIIzMdoAcGBSuBBAAK
oUQDQgAEzqPxdN94x8heL3LjgoDOqYIOsqhSAUY9o7ZAIQIE6IdeTaViLn6F+9TD
uUEuPIm7cW5AxLiCQR3pfp3dKUSSNg==
-----END EC PRIVATE KEY-----
-----BEGIN CERTIFICATE-----
MIIBuzCCAWOgAwIBAgIICJKqF5o1kZ4wCgYIKoZIzj0EAwIwHTEbMBkGA1UEAxMS
dmlkZXUgSldUIHRlc3Qga2V5MB4XDTIwMDExOTEzMTEwMFoXDTIxMDExODEzMTEw
MFowHTEbMBkGA1UEAxMSdmlkZXUgSldUIHRlc3Qga2V5MFYwEAYHKoZIzj0CAQYF
K4EEAAoDQgAEzqPxdN94x8heL3LjgoDOqYIOsqhSAUY9o7ZAIQIE6IdeTaViLn6F
+9TDuUEuPIm7cW5AxLiCQR3pfp3dKUSSNqOBjzCBjDAMBgNVHRMBAf8EAjAAMB0G
A1UdDgQWBBRBOemGGEDikAxkRV0LcIR7gWvupjALBgNVHQ8EBAMCBeAwHQYDVR0R
BBYwFIISdmlkZXUgSldUIHRlc3Qga2V5MBEGCWCGSAGG+EIBAQQEAwIGQDAeBglg
hkgBhvhCAQ0EERYPeGNhIGNlcnRpZmljYXRlMAoGCCqGSM49BAMCA0YAMEMCH2rW
7fnVDbMatVJZne6j8tvDW+FdTk/D5uQ7pUydBegCIAdjgDzenLYSwiA7D7ctspuW
GGnz57n2XdstL9f3UsWY
-----END CERTIFICATE-----
`;
