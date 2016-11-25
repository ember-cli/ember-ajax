import { describe, it } from 'mocha';
import { expect } from 'chai';

import { isFullURL, parseURL, haveSameHost } from 'ember-ajax/-private/utils/url-helpers';

describe('Unit | Utility | url helpers', function() {
  describe('parseURL', function() {
    it('parses the parts of a URL correctly', function() {
      const parsed = parseURL('https://google.com/test?a=b#hash');
      const desired = {
        hash: '#hash',
        hostname: 'google.com',
        href: 'https://google.com/test?a=b#hash',
        pathname: '/test',
        port: '',
        protocol: 'https:',
        search: '?a=b'
      };

      expect(parsed).to.deep.equal(desired);
    });
  });

  describe('isFullURL', function() {
    it('recognizes a URL with a protocol', function() {
      expect(isFullURL('http://google.com/test')).to.be.ok;
    });

    it('does not recognize a URL without a protocol', function() {
      expect(isFullURL('google.com/test')).not.to.be.ok;
    });

    it('is not tricked by a URL with a protocol as part of the path', function() {
      expect(isFullURL('test/http/http')).not.to.be.ok;
    });
  });

  describe('haveSameHost', function() {
    describe('matching hosts', function() {
      function verify(a, b) {
        expect(haveSameHost(a, b)).to.be.ok;
      }

      it('matches hosts with the same protocol, hostname and port', function() {
        verify('https://foo.com/foo', 'https://foo.com/bar');
      });
    });

    describe('mis-matched hosts', function() {
      function verify(a, b) {
        expect(haveSameHost(a, b)).not.to.be.ok;
      }

      it('does not match if the protocol is different', function() {
        verify('http://foo.com', 'https://foo.com');
      });

      it('does not match if the host name is different', function() {
        verify('https://bar.com', 'https://foo.com');
      });
    });
  });
});
