# Sample Configuration File from Production

The files in here are meant to give developers a better understanding of the
FreeTube system architecture.  They are *not* the *actual* configuration files
used in the FreeTube platform, and might even be dangerous to use as-is.  Don’t
even *think* about copy-pasting this into your own production server.

## General Architecture

There are a total of `n` instances of the backend server running on the host
machine, where `n` is any non-zero positive integer.  An nginx server is facing
the public internet and acts as a reverse proxy, SSL handler and load balancer
between server instances.  Upstream connections are established over `n` UNIX
sockets located in `/run/videu/backend/videu-backend-{0, 1, ...n-1}.sock`.
