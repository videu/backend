# The `/user/byUserName/:userName` API Endpoint

The `:userName` parameter is an @ handle consisting of alphanumeric characters
and underscores, and is between 3 and 16 characters long, see `userNameRegex`
in `/src/util/regex.ts`.  If the user name specified in this parameter does not
match said regular expression, the request is immediately rejected with an HTTP
400 response code.  The following paragraphs assume you submitted a
syntactically valid user name and therefore do not mention this behavior.

## GET

Sending an HTTP GET request will return a JSON object containing details about
athe requested user:

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
