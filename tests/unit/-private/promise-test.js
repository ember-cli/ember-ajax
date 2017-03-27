import { describe, it } from 'mocha';
import { expect } from 'chai';

import AJAXPromise from 'ember-ajax/-private/promise';

describe('Unit | AJAXPromise Class', function() {
  it('propigates the `xhr` property after calling `.then`', function() {
    const promise = AJAXPromise.resolve('foo');
    promise.xhr = { foo: 'bar' };

    const childPromise = promise.then((d) => d);
    expect(childPromise.xhr).to.equal(promise.xhr);
  });

  it('propigates the `xhr` property after calling `.catch`', function() {
    const promise = AJAXPromise.resolve('foo');
    promise.xhr = { foo: 'bar' };

    const childPromise = promise.catch((d) => d);
    expect(childPromise.xhr).to.equal(promise.xhr);
  });

  it('propigates the `xhr` property after calling `.finally`', function() {
    const promise = AJAXPromise.resolve('foo');
    promise.xhr = { foo: 'bar' };

    const childPromise = promise.finally((d) => d);
    expect(childPromise.xhr).to.equal(promise.xhr);
  });
});
