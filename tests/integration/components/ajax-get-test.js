import { beforeEach, afterEach, it, describe } from 'mocha';
import { expect } from 'chai';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, findAll, render } from '@ember/test-helpers';

import Pretender from 'pretender';
import { jsonFactory as json } from 'dummy/tests/helpers/json';

import hbs from 'htmlbars-inline-precompile';

let server;

describe('AjaxGetComponent', function() {
  setupRenderingTest();

  beforeEach(function() {
    server = new Pretender();
  });

  afterEach(function() {
    server.shutdown();
  });

  it('clicking Load Data loads data', async function() {
    const PAYLOAD = [{ title: 'Foo' }, { title: 'Bar' }, { title: 'Baz' }];

    server.get('/foo', json(200, PAYLOAD), 300);

    await render(hbs`
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

    await click('.ajax-get button');

    expect(findAll('.ajax-get li')[0].textContent).to.equal('Foo');
    expect(findAll('.ajax-get li')[1].textContent).to.equal('Bar');
    expect(findAll('.ajax-get li')[2].textContent).to.equal('Baz');
  });

  it('a payload that evaluates falsey but is not null or undefined loads as expected', async function() {
    const PAYLOAD = 0;

    server.get('/foo', json(200, PAYLOAD), 300);

    await render(hbs`
      {{#ajax-get url="/foo" as |data isLoaded|}}
        {{#if isLoaded}}
          <p>{{data}}</p>
        {{else}}
          <button {{action data}}>Load Data</button>
        {{/if}}
      {{/ajax-get}}
    `);

    await click('.ajax-get button');

    expect(find('.ajax-get p').textContent).to.equal('0');
  });
});
