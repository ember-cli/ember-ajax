import raw from './raw';

import Ember from 'ember';
const {deprecate} = Ember;

/*
 * jQuery.ajax wrapper, supports the same signature except providing
 * `success` and `error` handlers will throw an error (use promises instead)
 * and it resolves only the response (no access to jqXHR or textStatus).
 */
export default function request() {
  deprecate('ember-ajax/request is deprecated and will be removed in ember-ajax@2.0.0',
    false, { id: 'ember-ajax.raw' });
  return raw(...arguments).then(function(result) {
    return result.response;
  }, null, 'ember-ajax: unwrap raw ajax response');
}
