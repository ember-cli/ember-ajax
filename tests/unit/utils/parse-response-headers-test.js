import parseResponseHeaders from 'ember-ajax/utils/parse-response-headers';
import { describe, it } from 'mocha';
import { assert } from 'chai';

const { deepEqual, equal } = assert;

const CRLF = '\u000d\u000a';

describe('unit/adapters/parse-response-headers', function() {
  it('returns {} when headersString is undefined', function() {
    let headers = parseResponseHeaders(undefined);

    deepEqual(headers, {}, '{} is returned');
  });

  it('header parsing', function() {
    let headersString = [
      'Content-Encoding: gzip',
      'content-type: application/json; charset=utf-8',
      'date: Fri, 12 Feb 2016 19:21:00 GMT'
    ].join(CRLF);

    let headers = parseResponseHeaders(headersString);

    equal(headers['Content-Encoding'], 'gzip', 'parses basic header pair');
    equal(headers['content-type'], 'application/json; charset=utf-8', 'parses header with complex value');
    equal(headers.date, 'Fri, 12 Feb 2016 19:21:00 GMT', 'parses header with date value');
  });

  it('field-name parsing', function() {
    let headersString = [
      ' name-with-leading-whitespace: some value',
      'name-with-whitespace-before-colon : another value'
    ].join(CRLF);

    let headers = parseResponseHeaders(headersString);

    equal(headers['name-with-leading-whitespace'], 'some value', 'strips leading whitespace from field-name');
    equal(headers['name-with-whitespace-before-colon'], 'another value', 'strips whitespace before colon from field-name');
  });

  it('field-value parsing', function() {
    let headersString = [
      'value-with-leading-space: value with leading whitespace',
      'value-without-leading-space:value without leading whitespace',
      'value-with-colon: value with: a colon',
      'value-with-trailing-whitespace: banana '
    ].join(CRLF);

    let headers = parseResponseHeaders(headersString);

    equal(headers['value-with-leading-space'], 'value with leading whitespace', 'strips leading whitespace in field-value');
    equal(headers['value-without-leading-space'], 'value without leading whitespace', 'works without leaading whitespace in field-value');
    equal(headers['value-with-colon'], 'value with: a colon', 'has correct value when value contains a colon');
    equal(headers['value-with-trailing-whitespace'], 'banana', 'strips trailing whitespace from field-value');
  });

  it('ignores headers that do not contain a colon', function() {
    let headersString = [
      'Content-Encoding: gzip',
      'I am ignored because I do not contain a colon'
    ].join(CRLF);

    let headers = parseResponseHeaders(headersString);

    equal(headers['Content-Encoding'], 'gzip', 'parses basic header pair');
    equal(Object.keys(headers).length, 1, 'only has the one valid header');
  });
});
