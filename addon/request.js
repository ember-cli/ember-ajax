import raw from './raw';

/*
 * jQuery.ajax wrapper, supports the same signature except providing
 * `success` and `error` handlers will throw an error (use promises instead)
 * and it resolves only the response (no access to jqXHR or textStatus).
 */
export default function request() {
  return raw.apply(null, arguments).then(function(result) {
    return result.response;
  }, null, 'ember-ajax: unwrap raw ajax response');
}
