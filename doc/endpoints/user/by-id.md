# The `/user/byId/:id` API Endpoint

The `:id` parameter is to be replaced by a valid user id.  This is an
all-lowercase MongoDB Object ID encoded as a hexadecimal string
(see `userIdRegex` in `util/regex.ts` for the corresponding regular expression).
If the parameter does not pass this regular expression, the endpoint will always
reject the request with an HTTP 400 status code.  The description of the
individual request methods below will assume the user id is syntactically valid,
and therefore not mention this behavior explicitly.

## GET

Sending an HTTP GET request will return all public data associated with the user
that was requested:

```json
{
    "id": "5e206f7502d8d9252f33bbe6",
    "displayName": "John Doe",
    "userName": "john",
    "joined": 1579183989,
    "subCount": 5
}
```

- `id`: The unique user id.  This is the only identifier that is guaranteed to
  never change.  When storing references to users, use this property.
- `displayName`: The name to use for displaying the user.
- `userName`: The @ handle for identifying this user.  No assumptions must be
  made about whether this name will stay the same for any particular user.
- `joined`: A UNIX timestamp (in seconds) denoting the date this user signed up.
- `subCount` (**optional**): How many subscribers this user has.

If the specified user id was not found in the database, the server replies with
an HTTP 404 status code.  If the request contains an `Authorization` HTTP 
header, the reply MAY include additional data. 
