import parseResponseHeaders, {
  CRLF
} from 'ember-ajax/-private/utils/parse-response-headers';
import { describe, it } from 'mocha';
import { expect } from 'chai';

function buildHeaderString(array) {
  return array.join(CRLF);
}

function transform(value) {
  if (typeof value === 'string') {
    value = [value];
  }

  return parseResponseHeaders(buildHeaderString(value));
}

describe('unit/-private/utils/parse-response-headers', function() {
  describe('parsing headers', function() {
    it('can parse a set of multiple headers', function() {
      const headers = transform(['key: value', 'foo: bar']);

      expect(headers).to.deep.equal({
        key: 'value',
        foo: 'bar'
      });
    });

    it('returns an empty object when the headers are undefined', function() {
      const headers = parseResponseHeaders(undefined);

      expect(headers).to.deep.equal({});
    });

    it('ignores headers that do not contain a colon', function() {
      expect(transform('no colon')).to.deep.equal({});
    });
  });

  describe('extracting header names', function() {
    it('strips leading whitespace', function() {
      expect(transform(' key: value')).to.have.property('key');
    });

    it('strips trailing whitespace', function() {
      expect(transform('key : value')).to.have.property('key');
    });
  });

  describe('extracting header values', function() {
    describe('leading whitespace', function() {
      it('can handle it', function() {
        expect(transform('key: value')).to.have.property('key', 'value');
      });

      it('does not require it', function() {
        expect(transform('key:value')).to.have.property('key', 'value');
      });
    });

    describe('trailing whitespace', function() {
      it('can handle it', function() {
        expect(transform('key: value ')).to.have.property('key', 'value');
      });
    });

    it('can handle a value containing a colon', function() {
      expect(transform('key: colon : in value')).to.have.property(
        'key',
        'colon : in value'
      );
    });
  });
});
