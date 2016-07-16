import { describe, it } from 'mocha';
import { expect } from 'chai';

import ajax from 'ember-ajax';
import request from 'ember-ajax/request';

describe('export structure', function() {
  it('exports request function by default', function() {
    expect(ajax).to.deep.equal(request);
  });
});
