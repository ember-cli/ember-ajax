import { describe, it } from 'mocha';
import { assert } from 'chai';

import ajax from 'ember-ajax';
import request from 'ember-ajax/request';

const { equal } = assert;

describe('export', function() {
  it('ember-ajax exports request function', function() {
    equal(ajax, request);
  });
});
