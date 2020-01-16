# Data Flow on the videu Platform

videu uses multiple layers of abstraction in order to get data from storage to
the application.  This document illustrates a full fetch routine, from incoming
client request to outgoing response.

## 0. Error Handling

This being the most critical part in the entire chain cannot be stressed enough.
Every element described below may throw an `Error` at any point of time.  In
terms of the mostly `async` code architecture of videu, this means a Promise
being rejected.  Errors are usually passed up to the top of the call hierarchy,
the router in this case, to be handled there.  At the moment, it is the router's
responsibility to handle errors appropriately.

## 1. Router

When a client requests data, the request is first passed to the router
responsible for the specific API endpoint in question.  This router will then
validate the request: Are all required parameters present?  Does the user need
authentication?  And, a less common example, is the request with these
parameters fulfillable in the first place?  If any of those checks fails, the
request is rejected immediately.

## 2. Repository

Assimung the request was valid, the router fetches the data from a repository.
Repositories have a pool of one or more data sources (more on them in the next
chapter) to get the data from.  The repository will usually prefer the data
source that can deliver the required data the fastest.  If the data is not
available there, it will try another data source and repeat the procedure until
a request does not fail.  If all requests fail, the error is passed to the
router to be handled there.

## 3. Data Source

When looking at them as a black box, data sources work basically the same as
repositories:  they provide data.  However, as their name implies, they only
fetch data from a single source.  This can be a cache, database, or literally
any other storage method that may come up in the future.  Compared to
repositories, a single data source has a higher change of failing; this is
especially true for those managing a cache backend.
