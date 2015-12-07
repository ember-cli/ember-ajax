import { test } from 'qunit';
import moduleForAcceptance from 'dummy/tests/helpers/module-for-acceptance';

import Pretender from 'pretender';
import json from 'dummy/tests/helpers/json';

let server;

moduleForAcceptance('ajax-get component', {
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

test('waiting for a route with async widget', function(assert) {

  const PAYLOAD = [{title: 'Foo'}, {title: 'Bar'}, {title: 'Baz'}];

  server.get('/posts', json(200, PAYLOAD), 300);

  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.ok($('.ajax-get').length === 1, 'ajax-get component is rendered');
  });

  click('button:contains(Load Data)');

  andThen(function(){
    assert.equal($('.ajax-get li:eq(0)').text(), 'Foo');
    assert.equal($('.ajax-get li:eq(1)').text(), 'Bar');
    assert.equal($('.ajax-get li:eq(2)').text(), 'Baz');
  });

});

test(`Ajax failure doesn't bubble up to console.` , function(assert){

  server.get('/posts', json(404, "Not Found"), 300);

  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.ok($('.ajax-get').length === 1, 'ajax-get component is rendered');
  });

  click('button:contains(Load Data)');

  andThen(function(){
    assert.equal($('.ajax-get .error').text(), 'Not Found');
  });

});
