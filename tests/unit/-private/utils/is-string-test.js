import { describe, it } from 'mocha';
import { expect } from 'chai';
import isString from 'ember-ajax/-private/utils/is-string';

describe('-private/utils/is-string', function() {
  it('detects when something is a string', function() {
    expect(isString('foo')).to.be.ok;
  });

  describe('detecting something is not a string', function() {
    it('handles a number', function() {
      expect(isString(3)).not.to.be.ok;
    });

    it('handles `null`', function() {
      expect(isString(null)).not.to.be.ok;
    });

    it('handles `undefined`', function() {
      expect(isString(undefined)).not.to.be.ok;
    });
  });
});
