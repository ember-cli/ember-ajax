import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import LegacyNormalizeErrorResponseMixin from 'ember-ajax/mixins/legacy/normalize-error-response';

const AjaxRequest = EmberObject.extend(LegacyNormalizeErrorResponseMixin);
const service = new AjaxRequest();

describe('Unit | Mixin | legacy/normalize error response', function() {
  it('handles JSON:API formatted error objects', function() {
    const jsonApiError = service.normalizeErrorResponse(
      400,
      {},
      {
        errors: [{ status: 400, title: 'Foo' }, { status: 400, title: 'Foo' }]
      }
    );
    expect(jsonApiError).to.deep.equal([
      { status: '400', title: 'Foo' },
      { status: '400', title: 'Foo' }
    ]);
  });

  it('handles an object with an array of error strings', function() {
    const payloadWithErrorStrings = service.normalizeErrorResponse(
      400,
      {},
      {
        errors: ['This is an error', 'This is another error']
      }
    );
    expect(payloadWithErrorStrings).to.deep.equal([
      { status: '400', title: 'This is an error' },
      { status: '400', title: 'This is another error' }
    ]);
  });

  it('handles an array of error objects', function() {
    const payloadArrayOfObjects = service.normalizeErrorResponse(400, {}, [
      { status: 400, title: 'Foo' },
      { status: 400, title: 'Bar' }
    ]);
    expect(payloadArrayOfObjects).to.deep.equal([
      { status: '400', title: 'Foo', detail: { status: 400, title: 'Foo' } },
      { status: '400', title: 'Bar', detail: { status: 400, title: 'Bar' } }
    ]);
  });

  it('handles an array of strings', function() {
    const payloadArrayOfStrings = service.normalizeErrorResponse(400, {}, ['Foo', 'Bar']);
    expect(payloadArrayOfStrings).to.deep.equal([
      { status: '400', title: 'Foo' },
      { status: '400', title: 'Bar' }
    ]);
  });

  it('handles a string', function() {
    const payloadIsString = service.normalizeErrorResponse(400, {}, 'Foo');

    expect(payloadIsString).to.deep.equal([
      {
        status: '400',
        title: 'Foo'
      }
    ]);
  });

  it('handles an arbitrary object', function() {
    const payloadIsObject = service.normalizeErrorResponse(
      400,
      {},
      {
        title: 'Foo'
      }
    );
    expect(payloadIsObject).to.deep.equal([
      {
        status: '400',
        title: 'Foo',
        detail: {
          title: 'Foo'
        }
      }
    ]);
  });
});
