# ember-ajax

Provides Ajax Service for Ember applications.

* customizable service
* returns RSVP promises
* improved error handling
* ability to specify request headers

## Ajax Service

### Custom Request Headers

`ember-ajax` allows you to specify headers to be used with a request. This is
especially helpful when you have a session service that provides an auth token
that you have to include with the requests to authorize your requests.

To include custom headers to be used with your requests, you can specify `headers`
hash on the `Ajax Service`.

```js
import Ember from 'ember';
import AjaxService from 'ember-ajax/service';

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

#### Customize is isSuccess

Some APIs respond with status code 200, even though an error has occurred and
provide a status code in the payload. With the service, you can easily account
for this behaviour by overwriting the `isSuccess` method.

In app/services/ajax.js,

```js
import AjaxService from 'ember-ajax/service';

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
    //
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

1. `npm uninstall --save-dev ember-cli-ic-ajax`
2. `ember install ember-ajax`
3. Search and replace `ic-ajax` with `ember-ajax`

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
