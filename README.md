# ember-ajax [![Build Status](https://travis-ci.org/embersherpa/ember-ajax.svg)](https://travis-ci.org/embersherpa/ember-ajax) [![Ember Observer Score](http://emberobserver.com/badges/ember-ajax.svg)](http://emberobserver.com/addons/ember-ajax)

Provides Ajax Service for Ember 1.13+ applications.

* customizable service
* returns RSVP promises
* improved error handling
* ability to specify request headers
* upgrade path from `ic-ajax`

## Why an Ajax Service?

We need a singleton mechanism for making Ajax requests because currently many Ember
applications have at least two ways to talk to backend APIs. With Ember Data,
`RESTAdapter#ajax` offers the ability to specify custom headers and good error
reporting. When making requests that don't require Ember Data, getting the same
features is difficult because `ic-ajax` and `Ember.$.ajax` don't offer any
interfaces that can automatically set headers based on property of another
service (like a session service).

The idea with this addon is to provide a service that can be used by both
Ember Data and on ad-hoc bases and provides consistent interface for making
Ajax requests.

## Getting started

To use the ajax service, inject the `ajax` service into your route or component.

```js
import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),
  model() {
    return this.get('ajax').request('/posts');
  }
})
```

## Ajax Service

### Custom Request Headers

`ember-ajax` allows you to specify headers to be used with a request. This is
especially helpful when you have a session service that provides an auth token
that you have to include with the requests to authorize your requests.

To include custom headers to be used with your requests, you can specify `headers`
hash on the `Ajax Service`.

```js
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
    }
  })
});
```

### Error handling

`ember-ajax` provides built in error classes that you can use to check the error
that was returned by the response. This allows you to restrict determination of
error result to the service instead of sprinkling it around your code.

#### Customize isSuccess

Some APIs respond with status code 200, even though an error has occurred and
provide a status code in the payload. With the service, you can easily account
for this behaviour by overwriting the `isSuccess` method.

In app/services/ajax.js,

```js
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

#### Built in error types

`ember-ajax` has some built in error types that you can use to check error with
instanceof rather than by comparing to a number. The built in types are
`InvalidError`(422), `UnauthorizedError`(401) and `ForbiddenError`(403). Each of
these types has a corresponding is* method to allow you to customize how error
is determined.

```js
import Ember from 'ember';
import {UnauthorizedError, ForbiddenError} from 'ember-ajax/errors';

export default Ember.Route.extend({
  model() {
    return this.get('ajax').request('/user/me')
      .catch(function(error){
        if (error instanceof UnauthorizedError) {
          // user is not logged in
          this.transitionTo('login');
        } else if (error instanceof ForbiddenError) {
          // user doesn't have access to
          this.transitionTo('index');
        }
        throw error;
      });
  }
});
```

## Upgrade from `ic-ajax`

This addon was written to supersede `ic-ajax` and `ember-cli-ic-ajax` addon
because `ic-ajax` includes features and practices that are no longer considered
best practices.

`ic-ajax` also wraps requests in `Ember.run` which is no longer necessary on Ember 1.13+.
It also includes fixtures functionality which is inferior to [ember-cli-mirage](http://www.ember-cli-mirage.com).
Furthermore, `ic-ajax` author is no longer actively involved in the Ember community.

In most cases, it should be fairly easy to upgrade to `ember-ajax`. To aid you
in the migration process, I would recommend that you follow the following steps.

1. Install `ember-ajax` with `ember install ember-ajax`
2. Search and replace `ic-ajax` with `ember-ajax`
3. Run your test suite and look for `ic-ajax` related deprecations
4. Refactor your code to eliminate the deprecations.
5. Uninstall `ic-ajax` with `npm uninstall --save-dev ember-cli-ic-ajax`

Here is a list of notable changes that you need to consider when refactoring.

* `ic-ajax` is used by importing `ic-ajax` into a module. `ember-ajax` is used
  by injecting `ajax` service into a route or component.
* `ic-ajax` error handler returns a hash with { jqXHR, textStatus, errorThrown }.
  `ember-ajax` returns an error object that's an instance of `AjaxError`.
  `error` object will be either `AjaxError` with `error.status`, `InvalidError`,
   `UnauthorizedError` or `ForbiddenError`.
* When you `import ajax from 'ic-ajax'`, `ajax` function will resolve to payload,
  same way as `ajax.request`. `import raw from 'ic-ajax/raw'` resolves to raw
  `jqXHR` object with payload on `response` property.

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

## Special Thanks

This addon was based on ajax handing in Ember Data's Adapter.
