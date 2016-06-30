import { describe, beforeEach, afterEach, it } from 'mocha';
import { assert, expect } from 'chai';

import destroyApp from 'dummy/tests/helpers/destroy-app';
import startApp from 'dummy/tests/helpers/start-app';

import Pretender from 'pretender';
import { jsonFactory as json } from 'dummy/tests/helpers/json';

const { equal, ok } = assert;

let server, application;

describe('Acceptance | ajax-get component', function() {
  beforeEach(function() {
    server = new Pretender();
    application = startApp();
  });

  afterEach(function() {
    server.shutdown();
    destroyApp(application);
  });

  it('waiting for a route with async widget', function() {
    const PAYLOAD = [{ title: 'Foo' }, { title: 'Bar' }, { title: 'Baz' }];

    server.get('/posts', json(200, PAYLOAD), 300);

    visit('/');

    andThen(function() {
      equal(currentURL(), '/');
      ok(find('.ajax-get').length === 1);
    });

    click('button:contains(Load Data)');

    andThen(function() {
      equal(find('.ajax-get li:eq(0)').text(), 'Foo');
      equal(find('.ajax-get li:eq(1)').text(), 'Bar');
      equal(find('.ajax-get li:eq(2)').text(), 'Baz');
    });
  });

  it(`Ajax failure doesn't bubble up to console.` , function() {
    const errorMessage = 'Not Found';
    server.get('/posts', json(404, errorMessage), 300);

    visit('/');

    andThen(function() {
      expect(currentURL()).to.equal('/');
      expect(find('.ajax-get').length === 1).to.be.ok;
    });

    click('button:contains(Load Data)');

    andThen(function() {
      expect(find('.ajax-get .error').text()).to.equal(errorMessage);
    });
  });
});

