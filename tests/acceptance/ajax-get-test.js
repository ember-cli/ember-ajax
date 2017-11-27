import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';

import destroyApp from 'dummy/tests/helpers/destroy-app';
import startApp from 'dummy/tests/helpers/start-app';

import Pretender from 'pretender';
import { jsonFactory as json } from 'dummy/tests/helpers/json';

describe('Acceptance | ajax-get component', function() {
  beforeEach(function() {
    this.server = new Pretender();
    this.application = startApp();
  });

  afterEach(function() {
    this.server.shutdown();
    destroyApp(this.application);
  });

  it('waits for a route with async widget', function() {
    const PAYLOAD = [{ title: 'Foo' }, { title: 'Bar' }, { title: 'Baz' }];

    this.server.get('/posts', json(200, PAYLOAD), 300);

    visit('/');

    andThen(function() {
      expect(currentURL()).to.equal('/');
      expect(find('.ajax-get').length).to.equal(1);
    });

    click('button:contains(Load Data)');

    andThen(function() {
      expect(find('.ajax-get li:eq(0)').text()).to.equal('Foo');
      expect(find('.ajax-get li:eq(1)').text()).to.equal('Bar');
      expect(find('.ajax-get li:eq(2)').text()).to.equal('Baz');
    });
  });

  it('catches errors before they bubble to the console', function() {
    const errorMessage = 'Not Found';
    this.server.get('/posts', json(404, errorMessage), 300);

    visit('/');

    andThen(function() {
      expect(currentURL()).to.equal('/');
      expect(find('.ajax-get').length === 1).to.be.ok;
    });

    click('button:contains(Load Data)');

    andThen(function() {
      expect(
        find('.ajax-get .error')
          .text()
          .trim()
      ).to.equal(errorMessage);
    });
  });
});
