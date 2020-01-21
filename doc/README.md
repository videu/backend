# The videu Documentation

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in any
document located in this directory or one of its subdirectories are to be
interpreted as described in
[BCP 14](https://tools.ietf.org/html/bcp14)
\[[RFC2119](https://tools.ietf.org/html/rfc2119)\]
\[[RFC8174](https://tools.ietf.org/html/rfc8174)\]
when, and only when, they appear in all capitals, as shown here.

## Common Prerequisites

Many subdirectories in this section contain a `README` file (with an arbitrary
file extension).  These files describe the contents of their directory and
define prerequisites or conventions that are shared among all files.
Any file in this directory or one of its subdirectories assumes you have read
all `README` files in the entire hierarchy.

Example: The API endpoint for retrieving a user by their id is documented in
the file `/doc/endpoints/user/by-id.md`.  That means it assumes you have read
all of the following files:

- `/README.md`,
- `/doc/README.md` (this file),
- `/doc/endpoints/README.md`, and
- `/doc/endpoints/user/README.md`

## Building the API Documentation

The API documentation can be build by issuing the command `npm run-script doc`.
It will generate HTML files into `/doc/api`.  Please do not commit these files
(they are in our gitignore anyways) as they may get outdated.
