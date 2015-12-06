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
import wait from 'ember-test-helpers/wait';

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

const PAYLOAD = { posts: [ { id: 1, title: 'hello world' } ] };

test('service injected in component', function(assert) {
  assert.expect(3);
  server.get('/posts', json(200, PAYLOAD ));

  const authToken = 'foo';
  this.register('service:session', Service.extend({ authToken }));

  let receivedHeaders = [];
  this.register('service:fajax', AjaxService.extend({
    options() {
      let options = this._super(...arguments);
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
  this.register('component:async-widget', Component.extend({
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
    assert.deepEqual(response, PAYLOAD, "recieved PAYLOAD");
  });
});

test('error thrown in service can be caught with assert.throws', function(assert){
  server.post('/posts/1', json(404, { error: "not found" } ), 200);

  this.register('service:ajax', AjaxService.extend({
    customPOST(url) {
      return this.post(url).catch(function(e){
        throw e;
      });
    }
  }));

  this.register('component:async-widget', Ember.Component.extend({
    ajax: inject.service(),
    click() {
      this.get('ajax').customPOST(this.get('url'));
    }
  }));

  this.render(hbs`{{#async-widget classNames="async-widget" url="/posts/1"}}Post!{{/async-widget}}`);

  assert.throws(function(){
    this.$('.async-widget').click();
  }, 'Ajax operation failed');

});

test('waiting for promises to complete', function(assert){

  server.get('/foo', json(200, { foo: 'bar' }), 300);

  let component;

  this.register('component:async-widget', Ember.Component.extend({
    layout: hbs`{{yield foo}}`,
    ajax: inject.service(),
    foo: 'foo',
    click() {
      this.get('ajax').request('/foo').then(({foo})=>{
        component = this;
        this.set('foo', foo);
      });
    }
  }));

  this.render(hbs`{{#async-widget classNames="async-widget" as |foo|}}Got: {{foo}} for foo{{/async-widget}}`);

  assert.equal(this.$('.async-widget').text(), 'Got: foo for foo');
  this.$('.async-widget').click();

  return wait().then(()=>{
    assert.equal(this.$('.async-widget').text(), 'Got: bar for foo');
  });
});
