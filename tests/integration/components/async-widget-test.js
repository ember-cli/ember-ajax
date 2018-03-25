import Component from '@ember/component';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

import { beforeEach, afterEach, it, describe } from 'mocha';
import { expect } from 'chai';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, render } from '@ember/test-helpers';

import AjaxService from 'ember-ajax/services/ajax';
import Pretender from 'pretender';
import { jsonFactory as json } from 'dummy/tests/helpers/json';

const PAYLOAD = { posts: [{ id: 1, title: 'hello world' }] };
let server;

describe('AsyncWidgetComponent', function() {
  setupRenderingTest();

  beforeEach(function() {
    server = new Pretender();
  });

  afterEach(function() {
    server.shutdown();
  });

  it('service injected in component', async function() {
    server.get('/posts', json(200, PAYLOAD));

    const authToken = 'foo';
    this.owner.register('service:session', Service.extend({ authToken }));

    const receivedHeaders = [];
    this.owner.register(
      'service:fajax',
      AjaxService.extend({
        options() {
          const options = this._super(...arguments);

          Object.keys(options.headers).forEach(key => {
            receivedHeaders.push([key, options.headers[key]]);
          });

          return options;
        },
        session: service(),
        headers: computed('session.authToken', {
          get() {
            const headers = {};
            const authToken = this.get('session.authToken');

            if (authToken) {
              headers.authToken = authToken;
            }

            return headers;
          }
        })
      })
    );

    let component;
    this.owner.register(
      'component:async-widget',
      Component.extend({
        url: null,
        ajax: service('fajax'),
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
      })
    );

    await render(hbs`
      {{async-widget id="async-widget" url="/posts"}}
    `);

    const response = await component.loadData();

    component.set('hello', 'world');
    expect(component.get('helloStyle')).to.equal('hello world');
    expect(receivedHeaders[0]).to.deep.equal(['authToken', 'foo']);
    expect(response).to.deep.equal(PAYLOAD);
  });

  it.skip('error thrown in service can be caught in test', async function() {
    server.post('/posts/1', json(404, { error: 'not found' }), 200);

    this.owner.register(
      'service:ajax',
      AjaxService.extend({
        customPOST(url) {
          return this.post(url);
        }
      })
    );

    this.owner.register(
      'component:async-widget',
      Component.extend({
        ajax: service(),
        click() {
          this.get('ajax').customPOST(this.get('url'));
        }
      })
    );

    await render(hbs`
      {{#async-widget classNames="async-widget" url="/posts/1"}}
        Post!
      {{/async-widget}}
    `);

    expect(function() {
      this.$('.async-widget').click();
    }).to.throw();
  });

  it('waiting for promises to complete', async function() {
    server.get('/foo', json(200, { foo: 'bar' }), 300);

    this.owner.register(
      'component:async-widget',
      Component.extend({
        layout: hbs`{{yield foo}}`,
        ajax: service(),
        foo: 'foo',
        click() {
          this.get('ajax')
            .request('/foo')
            .then(({ foo }) => {
              this.set('foo', foo);
            });
        }
      })
    );

    await render(hbs`
      {{#async-widget classNames="async-widget" as |foo|}}
        Got: {{foo}} for foo
      {{/async-widget}}
    `);

    expect(find('.async-widget').textContent.trim()).to.equal(
      'Got: foo for foo'
    );

    await click('.async-widget');

    expect(find('.async-widget').textContent.trim()).to.equal(
      'Got: bar for foo'
    );
  });
});
