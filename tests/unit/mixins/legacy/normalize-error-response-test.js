import { expect } from 'chai';
import { describe, it } from 'mocha';
import Ember from 'ember';
import LegacyNormalizeErrorResponseMixin from 'ember-ajax/mixins/legacy/normalize-error-response';

const { Object: EmberObject } = Ember;
const AjaxRequest = EmberObject.extend(LegacyNormalizeErrorResponseMixin);

describe('Unit | Mixin | legacy/normalize error response', function() {
  it('formats the error response according to the legacy format', function() {
    const service = new AjaxRequest();

    const jsonApiError = service.normalizeErrorResponse(400, {}, {
      errors: [
        { status: 400, title: 'Foo' },
        { status: 400, title: 'Foo' }
      ]
    });
    expect(jsonApiError).to.deep.equal([
        { status: '400', title: 'Foo' },
        { status: '400', title: 'Foo' }
    ]);

    const payloadWithErrorStrings = service.normalizeErrorResponse(400, {}, {
      errors: [
        'This is an error',
        'This is another error'
      ]
    });
    expect(payloadWithErrorStrings).to.deep.equal([
      { status: '400', title: 'This is an error' },
      { status: '400', title: 'This is another error' }
    ]);

    const payloadArrayOfObjects = service.normalizeErrorResponse(400, {}, [
      { status: 400, title: 'Foo' },
      { status: 400, title: 'Bar' }
    ]);
    expect(payloadArrayOfObjects).to.deep.equal([
      { status: '400', title: 'Foo', detail: { status: 400, title: 'Foo' } },
      { status: '400', title: 'Bar', detail: { status: 400, title: 'Bar' } }
    ]);

    const payloadArrayOfStrings = service.normalizeErrorResponse(400, {}, [
      'Foo', 'Bar'
    ]);
    expect(payloadArrayOfStrings).to.deep.equal([
      { status: '400', title: 'Foo' },
      { status: '400', title: 'Bar' }
    ]);

    const payloadIsString = service.normalizeErrorResponse(400, {}, 'Foo');
    expect(payloadIsString).to.deep.equal([
      {
        status: '400',
        title: 'Foo'
      }
    ]);

    const payloadIsObject = service.normalizeErrorResponse(400, {}, {
      title: 'Foo'
    });
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
