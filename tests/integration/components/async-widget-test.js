import hbs from 'htmlbars-inline-precompile';
import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';

const { Component, inject } = Ember;

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
  assert.expect(1);
  const payload = { posts: [ { id: 1, title: 'hello world' } ] };
  server.get('/posts', json(200, payload ));

  let component;
  this.registry.register('component:async-widget', Component.extend({
    url: null,
    ajax: inject.service(),
    didInsertElement() {
      component = this;
    },
    loadData() {
      const url = this.get('url');
      return this.get('ajax').request(url);
    }
  }));

  this.render(hbs`{{async-widget id="async-widget" url="/posts"}}`);
  return component.loadData().then(function(response){
    assert.deepEqual(response, payload, "recieved payload");
  });
});
