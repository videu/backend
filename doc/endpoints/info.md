# The `/info` API Endpoint

## GET

Sending an HTTP GET request to `/info` will return a JSON object of this format:

```json
{
    "clientIp": "1.2.3.4",
    "instance": "instance-name",
    "time": 1234567890,
    "version": {
        "versionString": "0.1.0-alpha",
        "major": 0,
        "minor": 1,
        "patch": 0,
        "tags": [
            "alpha"
        ]
    }
}
```

The `clientIp` field is the IP address that sent the request.  `instance` is the
unique name of the backend instance that processed the request.  Depending on
the platform's size, there may be more than one individual instance.  The `time`
field contains the server's current UNIX timestamp in milliseconds.  Lastly, the
`version` attribute is an object containing information on the version of videu
that is currently running.  Its `versionString` field contains a string
representing the full version in the semver format, the `major`, `minor`,
`patch` and `tags` fields represent this version split up to the respective
components.
