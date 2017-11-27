import { A } from '@ember/array';
import { isNone } from '@ember/utils';

/**
 * Do a case-insensitive lookup of an HTTP header
 *
 * @function getHeader
 * @private
 * @param {Object} headers
 * @param {string} name
 * @return {string}
 */
export default function getHeader(headers, name) {
  if (isNone(headers) || isNone(name)) {
    return; // ask for nothing, get nothing.
  }

  const matchedKey = A(Object.keys(headers)).find(key => {
    return key.toLowerCase() === name.toLowerCase();
  });

  return headers[matchedKey];
}
