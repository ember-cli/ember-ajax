import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

import { describeComponent, it } from 'ember-mocha';
import { beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';

const { deepEqual, equal, throws } = assert;
const {
  Component,
  Service,
  inject,
  computed
} = Ember;

import AjaxService from 'ember-ajax/services/ajax';
import Pretender from 'pretender';
import { jsonFactory as json } from 'dummy/tests/helpers/json';
import wait from 'ember-test-helpers/wait';

const PAYLOAD = { posts: [ { id: 1, title: 'hello world' } ] };
let server;

describeComponent(
  'async-widget',
  'AsyncWidgetComponent',
  {
    integration: true
  },
  function() {
    beforeEach(function() {
      server = new Pretender();
    });

    afterEach(function() {
      server.shutdown();
    });

    it('service injected in component', function() {
      server.get('/posts', json(200, PAYLOAD));

      const authToken = 'foo';
      this.register('service:session', Service.extend({ authToken }));

      let receivedHeaders = [];
      this.register('service:fajax', AjaxService.extend({
        options() {
          let options = this._super(...arguments);
          Object.keys(options.headers).forEach((key) => {
            receivedHeaders.push([key, options.headers[key]]);
          });
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
      return component.loadData().then(function(response) {
        component.set('hello', 'world');
        equal(component.get('helloStyle'), 'hello world', 'run loop is not necessary');
        deepEqual(receivedHeaders[0], ['authToken', 'foo'], 'token was used session');
        deepEqual(response, PAYLOAD, 'recieved PAYLOAD');
      });
    });

    it.skip('error thrown in service can be caught in test', function() {
      server.post('/posts/1', json(404, { error: 'not found' }), 200);

      this.register('service:ajax', AjaxService.extend({
        customPOST(url) {
          return this.post(url);
        }
      }));

      this.register('component:async-widget', Component.extend({
        ajax: inject.service(),
        click() {
          this.get('ajax').customPOST(this.get('url'));
        }
      }));

      this.render(
        hbs`{{#async-widget classNames="async-widget" url="/posts/1"}}
              Post!
            {{/async-widget}}`
      );

      throws(function() {
        this.$('.async-widget').click();
      });
    });

    it('waiting for promises to complete', function() {
      server.get('/foo', json(200, { foo: 'bar' }), 300);

      this.register('component:async-widget', Component.extend({
        layout: hbs`{{yield foo}}`,
        ajax: inject.service(),
        foo: 'foo',
        click() {
          this.get('ajax').request('/foo').then(({ foo }) => {
            this.set('foo', foo);
          });
        }
      }));

      this.render(hbs`{{#async-widget classNames="async-widget" as |foo|}}Got: {{foo}} for foo{{/async-widget}}`);

      equal(this.$('.async-widget').text(), 'Got: foo for foo');
      this.$('.async-widget').click();

      return wait().then(() => {
        equal(this.$('.async-widget').text(), 'Got: bar for foo');
      });
    });
  }
);
