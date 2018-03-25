import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { visit, currentURL } from '@ember/test-helpers';

import AjaxService from 'ember-ajax/services/ajax';
import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

let server;

describe('Acceptance | ember data integration', function() {
  setupApplicationTest();

  beforeEach(function() {
    server = new Pretender();
  });

  afterEach(function() {
    server.shutdown();
  });

  it('can apply the Ember Ajax mixin to an Ember Data adapter', async function() {
    server.get('/api/posts/1', function() {
      return jsonResponse(200, {
        data: {
          id: 1,
          type: 'post',
          attributes: {
            title: 'Foo'
          }
        }
      });
    });

    await visit('/ember-data-test');

    expect(currentURL()).to.equal('/ember-data-test');
  });

  it('can set the namespace for all ajax requests', async function() {
    this.owner.register(
      'service:ajaxWithNs',
      AjaxService.extend({
        namespace: 'api'
      })
    );
    this.owner.inject(
      'adapter:application',
      'ajaxService',
      'service:ajaxWithNs'
    );

    server.get('/api/posts/1', function() {
      return jsonResponse(200, {
        data: {
          id: 1,
          type: 'post',
          attributes: {
            title: 'Foo'
          }
        }
      });
    });

    await visit('/ember-data-test');

    expect(currentURL()).to.equal('/ember-data-test');
  });

  it('respects ajaxOptions on the target adapter', async function() {
    server.get('/api/posts/1', function({ requestHeaders }) {
      expect(requestHeaders['X-Silly-Option']).to.equal('Hi!');

      return jsonResponse(200, {
        data: {
          id: 1,
          type: 'post',
          attributes: {
            title: 'Foo'
          }
        }
      });
    });

    await visit('/ember-data-test');

    expect(currentURL()).to.equal('/ember-data-test');
  });
});
