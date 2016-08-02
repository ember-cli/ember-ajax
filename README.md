# ember-ajax

[![Travis CI Build Status](https://travis-ci.org/ember-cli/ember-ajax.svg?branch=master)](https://travis-ci.org/ember-cli/ember-ajax)
[![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/rjfngst9s19p3cp8/branch/master?svg=true)](https://ci.appveyor.com/project/alexlafroscia/ember-ajax/branch/master)
[![Ember Observer Score](http://emberobserver.com/badges/ember-ajax.svg)](http://emberobserver.com/addons/ember-ajax)
![Ember Version][ember-version]

Service for making AJAX requests in Ember 1.13+ applications.

* customizable service
* returns RSVP promises
* improved error handling
* ability to specify request headers
* upgrade path from `ic-ajax`

## Getting started

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
the way that you would use `jQuery.ajax`.  In fact, `ember-ajax` is a wrapper
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
result of the request.  Your handler code inside `.then` or `.catch` will
automatically be wrapped in an Ember run loop for maximum compatibility with
Ember, right out of the box.

### HTTP-verbed methods

You can skip setting the `method` or `type` keys in your `options` object when
calling `request(url, options)` by instead calling `post(url, options)`,
`put(url, options)`, `patch(url, options)` or `del(url, options)`.

```js
post('/posts', { data: { title: 'Ember' } })    // Makes a POST request to /posts
put('/posts/1', { data: { title: 'Ember' } })   // Makes a PUT request to /posts/1
patch('/posts/1', { data: { title: 'Ember' } }) // Makes a PATCH request to /posts/1
del('/posts/1')                                 // Makes a DELETE request to /posts/1
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
  trustedHosts: [
    /\.example\./,
    'foo.bar.com',
  ]
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
request('/users/me')
```

You can even leave off the forward slash if you'd like:
```js
// GET http://api.example.com/users/me
request('users/me')
```

#### Customize isSuccess

Some APIs respond with status code 200, even though an error has occurred and
provide a status code in the payload. With the service, you can easily account
for this behaviour by overwriting the `isSuccess` method.

```js
// app/services/ajax.js

import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  isSuccess(status, headers, payload ) {
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

* `BadRequestError` (400)
* `UnauthorizedError`(401)
* `ForbiddenError`(403)
* `NotFoundError` (404)
* `InvalidError`(422)
* `ServerError` (5XX)
* `AbortError`
* `TimeoutError`

All of the above errors are subtypes of `AjaxError`.

#### Error detection helpers

`ember-ajax` comes with helper functions for matching response errors to their respective `ember-ajax` error type. Each of the errors listed above has a corresponding `is*` function (e.g., `isBadRequestError`).

Use of these functions is **strongly encouraged** to help eliminate the need for boilerplate error detection code.

```js
import Ember from 'ember';
import {isAjaxError, isNotFoundError, isForbiddenError} from 'ember-ajax/errors';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),
  model() {
    const ajax = this.get('ajax');

    return ajax.request('/user/doesnotexist')
      .catch(function(error) {
        if (isNotFoundError(error)) {
          // handle 404 errors here
          return;
        }

        if (isForbiddenError(error)) {
          // handle 403 errors here
          return;
        }

        if(isAjaxError(error)) {
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

## Usage with Ember Data

Ember AJAX provides a mixin that can be used in an Ember Data Adapter to avoid the networking code provided by Ember Data and rely on Ember AJAX instead. This serves as a first step toward true integration of Ember AJAX into Ember Data.

To use the mixin, you can include the mixin into an Adapter, like so:

```javascript
// app/adapters/application.js
import DS from 'ember-data';
import AjaxServiceSupport from 'ember-ajax/mixins/ajax-support';

export default DS.JSONAPIAdapter.extend(AjaxServiceSupport);
```

That's all the configuration required!  If you want to customize the adapter, such as using an alternative AJAX service (like one you extended yourself), hooks to do so are provided; check out the mixin's implementation for details.

Note that instead of using the Ember Data error checking code in your application, you should use the ones provided by Ember AJAX.

## Stand-Alone Usage

If you aren't using Ember Data and do not have access to services, you
can import the ajax utility like so:

```js
import request from 'ember-ajax/request';
```

Which will have the same API as the `ajax` service. If you want the raw jQuery XHR object
then you can use the `raw` method instead:

```js
import raw from 'ember-ajax/raw';
```

## Testing

### Fixture Data

When writing tests, you will often need to provide fixture data for your
application. This can be accomplished by mocking your server with
[`Pretender.js`](https://github.com/pretenderjs/pretender). You can use it
directly with [ember-cli-pretender](https://github.com/rwjblue/ember-cli-pretender)
or through a helper library.

If you're looking for a full featured mock server with fixtures support, choose
[EmberCLI Mirage](http://www.ember-cli-mirage.com/) otherwise use the leaner
[EmberCLI Fake Server](https://github.com/201-created/ember-cli-fake-server).

#### Error Handling

When writing integration & acceptance tests, your tests should be testing for
what the user can see. Therefore, your tests should be checking if the errors
are in the DOM. If errors bubble up to the console, then you should catch the
failure in your app code and present the errors to the user.

### Acceptance Tests

```javascript
import { test } from 'qunit';
import moduleForAcceptance from 'dummy/tests/helpers/module-for-acceptance';

import Pretender from 'pretender';

let server;

moduleForAcceptance('ajax-get component', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

test('waiting for a route with async widget', function(assert) {

  const PAYLOAD = [{ title: 'Foo' }, { title: 'Bar' }, { title: 'Baz' }];

  server.get('/posts', function(){
    return [ 200, {"Content-Type": "application/json"}, JSON.stringify(PAYLOAD) ];
  }, 300);

  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.ok($('.ajax-get').length === 1, 'ajax-get component is rendered');
  });

  click('button:contains(Load Data)');

  andThen(function(){
    assert.equal($('.ajax-get li:eq(0)').text(), 'Foo');
    assert.equal($('.ajax-get li:eq(1)').text(), 'Bar');
    assert.equal($('.ajax-get li:eq(2)').text(), 'Baz');
  });
});
```

### Integration Test

```javascript
import hbs from 'htmlbars-inline-precompile';
import {
  moduleForComponent,
  test
} from 'ember-qunit';

import Pretender from 'pretender';
import json from 'dummy/tests/helpers/json';
import wait from 'ember-test-helpers/wait';

let server;
moduleForComponent('ajax-get', {
  integration: true,
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

test('clicking Load Data loads data', function(assert) {
  const PAYLOAD = [{ title: 'Foo' }, { title: 'Bar' }, { title: 'Baz' }];

  server.get('/foo', json(200, PAYLOAD), 300);

  this.render(hbs`
    {{#ajax-get url="/foo" as |data isLoaded|}}
      {{#if isLoaded}}
        <ul>
        {{#each data as |post|}}
          <li>{{post.title}}</li>
        {{/each}}
        </ul>
      {{else}}
        <button {{action data}}>Load Data</button>
      {{/if}}
    {{/ajax-get}}
  `);

  this.$(`.ajax-get button`).click();

  return wait().then(function(){
    assert.equal($('.ajax-get li:eq(0)').text(), 'Foo');
    assert.equal($('.ajax-get li:eq(1)').text(), 'Bar');
    assert.equal($('.ajax-get li:eq(2)').text(), 'Baz');
  });
});
```

**Notice**, the `wait()` helper. It waits for Ajax requests to complete before
continuing.

## Upgrade from `ic-ajax`

This addon was written to supersede `ic-ajax` and `ember-cli-ic-ajax` addon
because `ic-ajax` includes features and practices that are no longer considered
best practices.

In most cases, it should be fairly easy to upgrade to `ember-ajax`. To aid
you in the migration process, I would recommend that you follow the following
steps.

1. Install `ember-ajax` with `ember install ember-ajax`
2. Search and replace `ic-ajax` with `ember-ajax`
3. Run your test suite and look for `ic-ajax` related deprecations
4. Refactor your code to eliminate the deprecations.
5. Uninstall `ic-ajax` with `npm uninstall --save-dev ember-cli-ic-ajax`

Here is a list of notable changes that you need to consider when refactoring.

* `ic-ajax` is used by importing `ic-ajax` into a module. `ember-ajax` is used
   by injecting `ajax` service into a route or component.
* `ic-ajax` error handler returns a hash with { jqXHR, textStatus, errorThrown }.
  `ember-ajax` returns an error object that's an instance of `AjaxError`. `error`
  object will be either `AjaxError` with `error.status` or one of the error
  types listed above.
* When you `import ajax from 'ic-ajax'`, `ajax` function will resolve to
  payload, same way as `ajax.request`. `import raw from 'ic-ajax/raw'`
  resolves to raw `jqXHR` object with payload on `response` property.

## Installation

### As an addon

* `ember install ember-ajax`

### For development

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

## Why an Ajax Service?

We need a singleton mechanism for making Ajax requests because currently many
Ember applications have at least two ways to talk to backend APIs. With Ember
Data, `RESTAdapter#ajax` offers the ability to specify custom headers and good
error reporting. When making requests that don't require Ember Data, getting
the same features is difficult because `ic-ajax` and `Ember.$.ajax` don't offer
any interfaces that can automatically set headers based on property of
another service (like a session service).

The idea with this addon is to provide a service that can be used by both
Ember Data and on ad-hoc bases and provides consistent interface for making
Ajax requests.

## Special Thanks

This addon was based on ajax handing in Ember Data's Adapter.

[ember-version]: https://embadge.io/v1/badge.svg?start=1.13.0
