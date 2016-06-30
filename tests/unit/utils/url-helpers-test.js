import { describe, it } from 'mocha';
import { assert } from 'chai';

import { RequestURL } from 'ember-ajax/utils/url-helpers';

const { equal, ok, notOk } = assert;

describe('Unit | Utility | url helpers', function() {
  it('RequestURL Class: parses the parts of a URL correctly', function() {
    const url = 'https://google.com/test?a=b#hash';
    const obj = new RequestURL(url);
    equal(obj.href, url);
    equal(obj.protocol, 'https:');
    equal(obj.hostname, 'google.com');
    // equal(obj.port, ''); TODO: Why does Phantom return '0'?
    equal(obj.pathname, '/test');
    equal(obj.search, '?a=b');
    equal(obj.hash, '#hash');
  });

  it('RequestURL Class: can detect if the url is complete', function() {
    const obj = new RequestURL('http://google.com/test');
    ok(obj.isComplete);

    const obj2 = new RequestURL('google.com/test');
    notOk(obj2.isComplete);

    const obj3 = new RequestURL('/test');
    notOk(obj3.isComplete);

    const obj4 = new RequestURL('test/http/http');
    notOk(obj4.isComplete);
  });

  it('RequestURL Class: can detect if two hosts are the same', function() {
    function sameHost(urlA, urlB, match = true) {
      const a = new RequestURL(urlA);
      const b = new RequestURL(urlB);
      if (match) {
        ok(a.sameHost(b), `${urlA} has the same host as ${urlB}`);
      } else {
        notOk(a.sameHost(b), `${urlA} does not have the same host as ${urlB}`);
      }
    }

    sameHost('https://google.com', 'https://google.com');
    sameHost('https://google.com', 'http://google.com', false);
    sameHost('http://google.com', 'google.com', false);
    sameHost('http://google.com:8080', 'http://google.com:8080');
    sameHost('http://google.com:8080', 'http://google.com:8081', false);
  });
});
