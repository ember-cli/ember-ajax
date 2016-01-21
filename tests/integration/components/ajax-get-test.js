import hbs from 'htmlbars-inline-precompile';
import {
  moduleForComponent,
  test
} from 'ember-qunit';

import Pretender from 'pretender';
import { jsonFactory as json } from 'dummy/tests/helpers/json';
import wait from 'ember-test-helpers/wait';

let server;
moduleForComponent('ajax-get', {
  integration: true,
  beforeEach() {
    server = new Pretender();
  },
  afterEach() {
    server.shutdown();
  }
});

test('clicking Load Data loads data', function(assert) {
  const PAYLOAD = [{ title: 'Foo' }, { title: 'Bar' }, { title: 'Baz' }];

  server.get('/foo', json(200, PAYLOAD), 300);

  this.render(hbs`
    {{#ajax-get url="/foo" as |data isLoaded|}}
      {{#if isLoaded}}
        <ul>
        {{#each data as |post|}}
          <li>{{post.title}}</li>
        {{/each}}
        </ul>
      {{else}}
        <button {{action data}}>Load Data</button>
      {{/if}}
    {{/ajax-get}}
  `);

  this.$(`.ajax-get button`).click();

  return wait().then(function() {
    assert.equal($('.ajax-get li:eq(0)').text(), 'Foo');
    assert.equal($('.ajax-get li:eq(1)').text(), 'Bar');
    assert.equal($('.ajax-get li:eq(2)').text(), 'Baz');
  });
});
