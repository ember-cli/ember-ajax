import { describeComponent, it } from 'ember-mocha';
import { beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';

import Pretender from 'pretender';
import { jsonFactory as json } from 'dummy/tests/helpers/json';
import wait from 'ember-test-helpers/wait';

import hbs from 'htmlbars-inline-precompile';

const { equal } = assert;

let server;
describeComponent(
  'ajax-get',
  'AjaxGetComponent',
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

    it('clicking Load Data loads data', function() {
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

      return wait().then(() => {
        equal(this.$('.ajax-get li:eq(0)').text(), 'Foo');
        equal(this.$('.ajax-get li:eq(1)').text(), 'Bar');
        equal(this.$('.ajax-get li:eq(2)').text(), 'Baz');
      });
    });
  }
);
