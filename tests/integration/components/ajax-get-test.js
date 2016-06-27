import { describeComponent, it } from 'ember-mocha';
import { beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';

import Pretender from 'pretender';
import { jsonFactory as json } from 'dummy/tests/helpers/json';
import wait from 'ember-test-helpers/wait';

import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'ajax-get',
  'AjaxGetComponent',
  {
    integration: true
  },
  function() {
    beforeEach(function() {
      this.server = new Pretender();
    });

    afterEach(function() {
      this.server.shutdown();
    });

    it('clicking Load Data loads data', function() {
      const PAYLOAD = [{ title: 'Foo' }, { title: 'Bar' }, { title: 'Baz' }];

      this.server.get('/foo', json(200, PAYLOAD), 300);

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
        expect(this.$('.ajax-get li:eq(0)').text()).to.equal('Foo');
        expect(this.$('.ajax-get li:eq(1)').text()).to.equal('Bar');
        expect(this.$('.ajax-get li:eq(2)').text()).to.equal('Baz');
      });
    });

    it('clicking Load Data loads data', function() {
      const PAYLOAD = [{ title: 'Foo' }, { title: 'Bar' }, { title: 'Baz' }];

      this.server.get('/foo', json(200, PAYLOAD), 300);

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
        expect(this.$('.ajax-get li:eq(0)').text()).to.equal('Foo');
        expect(this.$('.ajax-get li:eq(1)').text()).to.equal('Bar');
        expect(this.$('.ajax-get li:eq(2)').text()).to.equal('Baz');
      });
    });

    it('a payload that evaluates falsey but is not null or undefined loads as expected', function() {
      const PAYLOAD = 0;

      this.server.get('/foo', json(200, PAYLOAD), 300);

      this.render(hbs`
        {{#ajax-get url="/foo" as |data isLoaded|}}
          {{#if isLoaded}}
            <p>{{data}}</p>
          {{else}}
            <button {{action data}}>Load Data</button>
          {{/if}}
        {{/ajax-get}}
      `);

      this.$(`.ajax-get button`).click();

      return wait().then(() => {
        expect(this.$('.ajax-get p').text()).to.equal('0');
      });
    });
  }
);
