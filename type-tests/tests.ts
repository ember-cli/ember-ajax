import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

// eslint-ignore-next-line
declare global {
  const FastBoot: any;
}

Ember.Route.extend({
  ajax: Ember.inject.service('ajax'),
  model() {
    return this.get('ajax').request('/posts');
  }
});

Ember.Controller.extend({
  ajax: Ember.inject.service('ajax'),
  actions: {
    sendRequest() {
      this.get('ajax').headers; // $ExpectType Headers | undefined

      return this.get('ajax').request('/posts', {
        method: 'POST',
        data: {
          foo: 'bar'
        }
      });
    }
  }
});

AjaxService.extend({
  session: Ember.inject.service(),
  headers: Ember.computed('session.authToken', {
    get() {
      const headers: { [k: string]: string | undefined } = {};
      const authToken = this.get('session.authToken');
      if (authToken) {
        headers['auth-token'] = authToken;
      }
      return headers;
    }
  })
});
