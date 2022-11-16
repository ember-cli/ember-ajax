# ember-ajax

[![npm version](https://badge.fury.io/js/ember-ajax.svg)](https://badge.fury.io/js/ember-ajax)
[![Travis CI Build Status](https://travis-ci.org/ember-cli/ember-ajax.svg?branch=master)](https://travis-ci.org/ember-cli/ember-ajax)
[![Ember Observer Score](http://emberobserver.com/badges/ember-ajax.svg)](http://emberobserver.com/addons/ember-ajax)

Service for making AJAX requests in Ember applications.

- customizable service
- returns RSVP promises
- improved error handling
- ability to specify request headers

## :warning: Deprecated

`ember-ajax` is now deprecated. Please consider using [`ember-fetch`](https://github.com/ember-cli/ember-fetch), or [`ember-ajax-fetch`](https://github.com/expel-io/ember-ajax-fetch) as a more direct replacement.

## Getting started

If you're just starting out, you already have `ember-ajax` installed! However, if it's missing from your `package.json`, you can add it by doing:

```sh
ember install ember-ajax
```

To use the ajax service, inject the `ajax` service into your route or component.

```js
import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),
  model() {
    return this.get('ajax').request('/posts');
  }
});
```

## Ajax Service

### Basic Usage

The AJAX service provides methods to be used to make AJAX requests, similar to
the way that you would use `jQuery.ajax`. In fact, `ember-ajax` is a wrapper
around jQuery's method, and can be configured in much the same way.

In general, you will use the `request(url, options)` method, where `url` is the
destination of the request and `options` is a configuration hash for
[`jQuery.ajax`](http://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings).

```javascript
import Ember from 'ember';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  actions: {
    sendRequest() {
      return this.get('ajax').request('/posts', {
        method: 'POST',
        data: {
          foo: 'bar'
        }
      });
    }
  }
});
```

In this example, `this.get('ajax').request()` will return a promise with the
result of the request. Your handler code inside `.then` or `.catch` will
automatically be wrapped in an Ember run loop for maximum compatibility with
Ember, right out of the box.

### HTTP-verbed methods

You can skip setting the `method` or `type` keys in your `options` object when
calling `request(url, options)` by instead calling `post(url, options)`,
`put(url, options)`, `patch(url, options)` or `del(url, options)`.

```js
post('/posts', { data: { title: 'Ember' } }); // Makes a POST request to /posts
put('/posts/1', { data: { title: 'Ember' } }); // Makes a PUT request to /posts/1
patch('/posts/1', { data: { title: 'Ember' } }); // Makes a PATCH request to /posts/1
del('/posts/1'); // Makes a DELETE request to /posts/1
```

### Custom Request Headers

`ember-ajax` allows you to specify headers to be used with a request. This is
especially helpful when you have a session service that provides an auth token
that you have to include with the requests to authorize your requests.

To include custom headers to be used with your requests, you can specify
`headers` hash on the `Ajax Service`.

```js
// app/services/ajax.js

import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  session: Ember.inject.service(),
  headers: Ember.computed('session.authToken', {
    get() {
      let headers = {};
      const authToken = this.get('session.authToken');
      if (authToken) {
        headers['auth-token'] = authToken;
      }
      return headers;
    }
  })
});
```

Headers by default are only passed if the hosts match, or the request is a relative path.
You can overwrite this behavior by either passing a host in with the request, setting the
host for the ajax service, or by setting an array of `trustedHosts` that can be either
an array of strings or regexes.

```js
// app/services/ajax.js

import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  trustedHosts: [/\.example\./, 'foo.bar.com']
});
```

### Custom Endpoint Path

The `namespace` property can be used to prefix requests with a specific url namespace.

```js
// app/services/ajax.js
import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  namespace: '/api/v1'
});
```

`request('/users/me')` would now target `/api/v1/users/me`

If you need to override the namespace for a custom request, use the `namespace` as an option to the request methods.

```js
// GET /api/legacy/users/me
request('/users/me', { namespace: '/api/legacy' });
```

### Custom Host

`ember-ajax` allows you to specify a host to be used with a request. This is
especially helpful so you don't have to continually pass in the host along
with the path, makes `request()` a bit cleaner.

To include a custom host to be used with your requests, you can specify `host`
property on the `Ajax Service`.

```js
// app/services/ajax.js

import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  host: 'http://api.example.com'
});
```

That allows you to only have to make a call to `request()` as such:

```js
// GET http://api.example.com/users/me
request('/users/me');
```

### Custom Content-Type

`ember-ajax` allows you to specify a default [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) header to be used with a request.

To include a custom Content-Type you can specify `contentType` property on the `Ajax Service`.

```js
// app/services/ajax.js

import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  contentType: 'application/json; charset=utf-8'
});
```

You can also override the Content-Type per `request` with the `options` parameter.

#### Customize isSuccess

Some APIs respond with status code 200, even though an error has occurred and
provide a status code in the payload. With the service, you can easily account
for this behaviour by overwriting the `isSuccess` method.

```js
// app/services/ajax.js

import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  isSuccess(status, headers, payload) {
    let isSuccess = this._super(...arguments);
    if (isSuccess && payload.status) {
      // when status === 200 and payload has status property,
      // check that payload.status is also considered a success request
      return this._super(payload.status);
    }
    return isSuccess;
  }
});
```

### Error handling

`ember-ajax` provides built in error classes that you can use to check the error
that was returned by the response. This allows you to restrict determination of
error result to the service instead of sprinkling it around your code.

#### Built in error types

`ember-ajax` has built-in error types that will be returned from the service in the event of an error:

- `BadRequestError` (400)
- `UnauthorizedError`(401)
- `ForbiddenError`(403)
- `NotFoundError` (404)
- `InvalidError`(422)
- `ServerError` (5XX)
- `AbortError`
- `TimeoutError`

All of the above errors are subtypes of `AjaxError`.

#### Error detection helpers

`ember-ajax` comes with helper functions for matching response errors to their respective `ember-ajax` error type. Each of the errors listed above has a corresponding `is*` function (e.g., `isBadRequestError`).

Use of these functions is **strongly encouraged** to help eliminate the need for boilerplate error detection code.

```js
import Ember from 'ember';
import {
  isAjaxError,
  isNotFoundError,
  isForbiddenError
} from 'ember-ajax/errors';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),
  model() {
    const ajax = this.get('ajax');

    return ajax.request('/user/doesnotexist').catch(function(error) {
      if (isNotFoundError(error)) {
        // handle 404 errors here
        return;
      }

      if (isForbiddenError(error)) {
        // handle 403 errors here
        return;
      }

      if (isAjaxError(error)) {
        // handle all other AjaxErrors here
        return;
      }

      // other errors are handled elsewhere
      throw error;
    });
  }
});
```

If your errors aren't standard, the helper function for that error type can be used as the base to build your custom detection function.

#### Access the response in case of error

If you need to access the json response of a request that failed, you can use the `raw` method instead of `request`.

```js
this.get('ajax')
  .raw(url, options)
  .then(({ response }) => this.handleSuccess(response))
  .catch(({ response, jqXHR, payload }) => this.handleError(response));
```

Note that in this use case there's no access to the error object. You can inspect the `jqXHR` object for additional information about the failed request. In particular `jqXHR.status` returns the relevant HTTP error code.

## Usage with Ember Data

Ember AJAX provides a mixin that can be used in an Ember Data Adapter to avoid the networking code provided by Ember Data and rely on Ember AJAX instead. This serves as a first step toward true integration of Ember AJAX into Ember Data.

To use the mixin, you can include the mixin into an Adapter, like so:

```javascript
// app/adapters/application.js
import DS from 'ember-data';
import AjaxServiceSupport from 'ember-ajax/mixins/ajax-support';

export default DS.JSONAPIAdapter.extend(AjaxServiceSupport);
```

That's all the configuration required! If you want to customize the adapter, such as using an alternative AJAX service (like one you extended yourself), hooks to do so are provided; check out the mixin's implementation for details.

Note that instead of using the Ember Data error checking code in your application, you should use the ones provided by Ember AJAX.

## Stand-Alone Usage

If you aren't using Ember Data and do not have access to services, you
can import the ajax utility like so:

```js
import request from 'ember-ajax/request';

export default function someUtility(url) {
  var options = {
    // request options
  };

  return request(url, options).then(response => {
    // `response` is the data from the server
    return response;
  });
}
```

Which will have the same API as the `ajax` service. If you want the raw jQuery XHR object
then you can use the `raw` method instead:

```js
import raw from 'ember-ajax/raw';

export default function someOtherUtility(url) {
  var options = {
    // raw options
  };

  return raw(url, options).then(result => {
    // `result` is an object containing `response` and `jqXHR`, among other items
    return result;
  });
}
```

## Local Development

This information is only relevant if you're looking to contribute to `ember-ajax`.

### Compatibility

- Node.js 6 or above
- Ember CLI v2.13 or above

### Installation

- `git clone` this repository
- `npm install`

### Running

- `ember server`
- Visit your app at http://localhost:4200.

### Running Tests

- `ember test`
- `ember test --server`

### Building

- `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
