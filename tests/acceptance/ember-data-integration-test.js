import { describe, beforeEach, afterEach, it } from 'mocha';
import { assert } from 'chai';

const { equal } = assert;

import destroyApp from 'dummy/tests/helpers/destroy-app';
import startApp from 'dummy/tests/helpers/start-app';

import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

let server, application;

describe('Acceptance | ember data integration', function() {
  beforeEach(function() {
    server = new Pretender();
    application = startApp();
  });
  afterEach(function() {
    server.shutdown();
    destroyApp(application);
  });

  it('ember data adapter uses ember-ajax mixin', function() {
    server.get('api/posts/1', function() {
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

    visit('/ember-data-test');

    andThen(function() {
      equal(currentURL(), '/ember-data-test');
    });
  });
});
