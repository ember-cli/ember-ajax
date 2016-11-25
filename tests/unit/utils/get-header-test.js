import getHeader from 'ember-ajax/-private/utils/get-header';
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('getHeader', function() {
  it('returns undefined when headers are undefined', function() {
    const header = getHeader(undefined);

    expect(header).to.equal(undefined, 'undefined is returned');
  });

  it('returns undefined when name is undefined', function() {
    const header = getHeader({}, undefined);

    expect(header).to.equal(undefined, 'undefined is returned');
  });

  it('matches result given by direct object access', function() {
    const headers = {
      'Content-Encoding': 'gzip',
      'content-type': 'application/json; charset=utf-8',
      'date': 'Fri, 12 Feb 2016 19:21:00 GMT'
    };

    expect(getHeader(headers, 'Content-Encoding')).to.equal(headers['Content-Encoding'], 'matches direct object access');
    expect(getHeader(headers, 'content-type')).to.equal(headers['content-type'], 'matches direct object access');
    expect(getHeader(headers, 'date')).to.equal(headers.date, 'matches direct object access');
  });

  it('performs case-insensitive lookup', function() {
    const headers = {
      'Content-Encoding': 'gzip',
      'content-type': 'application/json; charset=utf-8',
      'date': 'Fri, 12 Feb 2016 19:21:00 GMT'
    };

    expect(getHeader(headers, 'CoNtEnT-EnCoDiNg')).to.equal(headers['Content-Encoding'], 'matches case-insensitive header');
    expect(getHeader(headers, 'Content-Type')).to.equal(headers['content-type'], 'matches case-insensitive header');
    expect(getHeader(headers, 'DATE')).to.equal(headers.date, 'matches case-insensitive header');
  });
});
