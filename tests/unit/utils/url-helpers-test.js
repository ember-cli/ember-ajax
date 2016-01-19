import { RequestURL } from 'ember-ajax/utils/url-helpers';
import { module, test } from 'qunit';

module('Unit | Utility | url helpers');

test('RequestURL Class: parses the parts of a URL correctly', function(assert) {
  const url = 'https://google.com/test?a=b#hash';
  const obj = new RequestURL(url);
  assert.equal(obj.href, url);
  assert.equal(obj.protocol, 'https:');
  assert.equal(obj.hostname, 'google.com');
  assert.equal(obj.port, '');
  assert.equal(obj.pathname, '/test');
  assert.equal(obj.search, '?a=b');
  assert.equal(obj.hash, '#hash');
});

test('RequestURL Class: can detect if the url is absolute', function(assert) {
  const obj = new RequestURL('http://google.com/test');
  assert.ok(obj.isAbsolute);

  const obj2 = new RequestURL('google.com/test');
  assert.notOk(obj2.isAbsolute);

  const obj3 = new RequestURL('/test');
  assert.notOk(obj3.isAbsolute);

  const obj4 = new RequestURL('test/http/http');
  assert.notOk(obj4.isAbsolute);
});

test('RequestURL Class: can detect if two hosts are the same', function(assert) {
  function assertSameHost(urlA, urlB, match = true) {
    const a = new RequestURL(urlA);
    const b = new RequestURL(urlB);
    if (match) {
      assert.ok(a.sameHost(b), `${urlA} has the same host as ${urlB}`);
    } else {
      assert.notOk(a.sameHost(b), `${urlA} does not have the same host as ${urlB}`);
    }
  }

  assertSameHost('https://google.com', 'https://google.com');
  assertSameHost('https://google.com', 'http://google.com', false);
  assertSameHost('http://google.com', 'google.com', false);
});
