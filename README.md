# The videu Backend Server

[![Build Status](https://jenkins.sandtler.club/buildStatus/icon?job=videu%2Fbackend)](https://jenkins.sandtler.club/job/videu/job/backend/)
[![Code Coverage](https://img.shields.io/jenkins/coverage/api?jobUrl=https%3A%2F%2Fjenkins.sandtler.club%2Fjob%2Fvideu%2Fjob%2Fbackend)](https://jenkins.sandtler.club/job/videu/job/backend/coverage/)

This is the source tree of the videu backend server, the RESTful HTTP API that
powers the [FreeTube](https://freetube.eu) platform.

## WARNING: This Is Pre-Alpha Software!

This application should not be exposed to the Internet because it is not
stable yet.

## License

Copyright &copy; 2020 The videu Project.  All rights reserved.

This software is licensed under the AGPLv3, see the `LICENSE` file for details.

## Development Setup

You will need:

- NodeJS >= 12.4 (and `npm` ofc)
- a MongoDB server (there are plans for using
  [`mongodb-memory-server`](https://www.npmjs.com/package/mongodb-memory-server)
  in development mode by default, but this is not a priority right now)
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

## The Obligatory Begging for Money

Yes, asking for money when there is almost no working code yet is quite bold,
but *come on*.  I am a broke student who literally re-writes YouTube all by
himself.  If you got some money to spend, I would highly appreciate it if you
gave me a buck or two so I don't have to die from starvation.

**PayPal**: https://paypal.me/sandtler  
**BTC**: `bc1q9zj2ay3zz97rpf7kfw8a5w8d7acs73zdkeepny`  
**ETH**: `0x99aFdc6EE3e7cAB67e83E56598fee77BFc21dC56`

It should be noted, however, that you absolutely don't *have* to donate
something if you don't want to.
