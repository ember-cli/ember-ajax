import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { click, currentURL, find, findAll, visit } from '@ember/test-helpers';

import Pretender from 'pretender';
import { jsonFactory as json } from 'dummy/tests/helpers/json';

let server;

describe('Acceptance | ajax-get component', function() {
  setupApplicationTest();

  beforeEach(function() {
    server = new Pretender();
  });

  afterEach(function() {
    server.shutdown();
  });

  it('waits for a route with async widget', async function() {
    const PAYLOAD = [{ title: 'Foo' }, { title: 'Bar' }, { title: 'Baz' }];

    server.get('/posts', json(200, PAYLOAD), 300);

    await visit('/');

    expect(currentURL()).to.equal('/');
    expect(find('.ajax-get')).to.be.ok;

    await click('button');

    expect(findAll('.ajax-get li')[0].textContent).to.equal('Foo');
    expect(findAll('.ajax-get li')[1].textContent).to.equal('Bar');
    expect(findAll('.ajax-get li')[2].textContent).to.equal('Baz');
  });

  it('catches errors before they bubble to the console', async function() {
    const errorMessage = 'Not Found';
    server.get('/posts', json(404, errorMessage), 300);

    await visit('/');

    expect(currentURL()).to.equal('/');
    expect(find('.ajax-get')).to.be.ok;

    await click('button');

    expect(find('.ajax-get .error').textContent.trim()).to.equal(errorMessage);
  });
});
