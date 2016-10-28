import getHeader from 'ember-ajax/utils/get-header';
import { describe, it } from 'mocha';
import { assert } from 'chai';

const { equal } = assert;

describe('getHeader', function() {
  it('returns undefined when headers are undefined', function() {
    let header = getHeader(undefined);

    equal(header, undefined, 'undefined is returned');
  });

  it('returns undefined when name is undefined', function() {
    let header = getHeader({}, undefined);

    equal(header, undefined, 'undefined is returned');
  });

  it('matches result given by direct object access', function() {
    let headers = {
      'Content-Encoding': 'gzip',
      'content-type': 'application/json; charset=utf-8',
      'date': 'Fri, 12 Feb 2016 19:21:00 GMT'
    };

    equal(getHeader(headers, 'Content-Encoding'), headers['Content-Encoding'], 'matches direct object access');
    equal(getHeader(headers, 'content-type'), headers['content-type'], 'matches direct object access');
    equal(getHeader(headers, 'date'), headers.date, 'matches direct object access');
  });

  it('performs case-insensitive lookup', function() {
    let headers = {
      'Content-Encoding': 'gzip',
      'content-type': 'application/json; charset=utf-8',
      'date': 'Fri, 12 Feb 2016 19:21:00 GMT'
    };

    equal(getHeader(headers, 'CoNtEnT-EnCoDiNg'), headers['Content-Encoding'], 'matches case-insensitive header');
    equal(getHeader(headers, 'Content-Type'), headers['content-type'], 'matches case-insensitive header');
    equal(getHeader(headers, 'DATE'), headers.date, 'matches case-insensitive header');
  });
});
