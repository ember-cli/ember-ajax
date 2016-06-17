import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

let server;
moduleForAcceptance('Acceptance | ember data integration', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

test('ember data adapter uses ember-ajax mixin', function(assert) {
  assert.expect(2);

  server.get('api/posts/1', function() {
    assert.ok(true, 'Used the ember-ajax integration');
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
    assert.equal(currentURL(), '/ember-data-test');
  });
});
