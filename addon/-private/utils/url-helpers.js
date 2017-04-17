/* eslint-env browser, node */

import require from 'require';
import isFastBoot from 'ember-ajax/-private/utils/is-fastboot';

const completeUrlRegex = /^(http|https)/;

/*
 * Isomorphic URL parsing
 * Borrowed from
 * http://www.sitepoint.com/url-parsing-isomorphic-javascript/
 */
const isNode = typeof self === 'undefined'
  && typeof process !== 'undefined'
  && {}.toString.call(process) === '[object process]';

const url = (function() {
  if (isFastBoot) {
    // ember-fastboot-server provides the node url module as URL global
    return URL;
  }

  if (isNode) {
    return require('url');
  }

  return document.createElement('a');
})();

/**
 * Parse a URL string into an object that defines its structure
 *
 * The returned object will have the following properties:
 *
 *   href: the full URL
 *   protocol: the request protocol
 *   hostname: the target for the request
 *   port: the port for the request
 *   pathname: any URL after the host
 *   search: query parameters
 *   hash: the URL hash
 *
 * @function parseURL
 * @private
 * @param {string} str The string to parse
 * @return {Object} URL structure
 */
export function parseURL(str) {
  let fullObject;

  if (isNode || isFastBoot) {
    fullObject = url.parse(str);
  } else {
    url.href = str;
    fullObject = url;
  }

  const desiredProps = {};
  desiredProps.href = fullObject.href;
  desiredProps.protocol = fullObject.protocol;
  desiredProps.hostname = fullObject.hostname;
  desiredProps.port = fullObject.port;
  desiredProps.pathname = fullObject.pathname;
  desiredProps.search = fullObject.search;
  desiredProps.hash = fullObject.hash;
  return desiredProps;
}

export function isFullURL(url) {
  return url.match(completeUrlRegex);
}

export function haveSameHost(a, b) {
  a = parseURL(a);
  b = parseURL(b);

  return (
    (a.protocol === b.protocol)
    && (a.hostname === b.hostname)
    && (a.port === b.port)
  );
}
