# The videu Backend Server

This is the source tree of the videu backend server, the RESTful HTTP API that
powers the [FreeTube](https://freetube.eu) platform.

## **IMPORTANT**: This is Pre-Alpha Software!



## License

Copyright © 2020 The videu Project <videu@freetube.eu>

This software is licensed under the AGPLv3, see the LICENSE file for details.

## Development Setup

You will need:

- NodeJS >= 10
- a MongoDB server
- a UNIX system (Linux, *BSD and MacOS should all work)
- a decent IDE with TypeScript support
- (optionally) an SMTP server with TLS support

You might be able to run it on Windows, but this is not supported and highly
discouraged.  If you absolutely need to, use the Windows Subsystem for Linux.

Clone the repository, open a shell in the project's root directory and type
`npm i` to install all dependencies.  Copy the `.env.default` file to `.env`
and adjust the configuration parameters accordingly.  Finally, type
`npm run-script dev` to start a local development server.

We recommend [Postman](https://www.getpostman.com/) for sending requests, but
you can basically use any other REST debugging tool (or `curl` if you're a
UNIX neckbeard).
