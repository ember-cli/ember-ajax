import hbs from 'htmlbars-inline-precompile';
import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';

const {
  Component,
  Service,
  inject,
  computed
} = Ember;

import AjaxService from 'ember-ajax/services/ajax';
import Pretender from 'pretender';
import json from 'dummy/tests/helpers/json';


let server;
moduleForComponent('async-widget', {
  integration: true,
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

test('service injected in component', function(assert) {
  assert.expect(3);
  const payload = { posts: [ { id: 1, title: 'hello world' } ] };
  server.get('/posts', json(200, payload ));

  const authToken = 'foo';
  this.registry.register('service:session', Service.extend({ authToken }));

  let receivedHeaders = [];
  this.registry.register('service:fajax', AjaxService.extend({
    options() {
      let options = this._super.apply(this, arguments);
      var fakeXHR = {
        setRequestHeader: function(key, value) {
          receivedHeaders.push([key, value]);
        }
      };
      options.beforeSend(fakeXHR);
      return options;
    },
    session: inject.service(),
    headers: computed('session.authToken', {
      get() {
        const headers = {};
        let authToken = this.get('session.authToken');
        if (authToken) {
          headers.authToken = authToken;
        }
        return headers;
      }
    })
  }));

  let component;
  this.registry.register('component:async-widget', Component.extend({
    url: null,
    ajax: inject.service('fajax'),
    didInsertElement() {
      component = this;
    },
    loadData() {
      const url = this.get('url');
      return this.get('ajax').request(url);
    },
    helloStyle: computed('hello', {
      get() {
        return `hello ${this.get('hello')}`;
      }
    })
  }));

  this.render(hbs`{{async-widget id="async-widget" url="/posts"}}`);
  return component.loadData().then(function(response){
    component.set('hello', 'world');
    assert.deepEqual(component.get('helloStyle'), 'hello world', 'run loop is not necessary');
    assert.deepEqual(receivedHeaders[0], ['authToken', 'foo'], 'token was used session');
    assert.deepEqual(response, payload, "recieved payload");
  });
});
