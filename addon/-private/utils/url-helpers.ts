/* eslint-env browser, node */

const completeUrlRegex = /^(http|https)/;

interface URLObject {
  href?: string;
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}

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
 */
export function parseURL(str: string): URLObject {
  let fullObject: URLObject;

  if (typeof FastBoot === 'undefined') {
    const element = document.createElement('a');
    element.href = str;
    fullObject = element;
  } else {
    fullObject = FastBoot.require('url').parse(str);
  }

  const desiredProps = {
    href: fullObject.href,
    protocol: fullObject.protocol,
    hostname: fullObject.hostname,
    port: fullObject.port,
    pathname: fullObject.pathname,
    search: fullObject.search,
    hash: fullObject.hash
  };

  return desiredProps;
}

export function isFullURL(url: string): boolean {
  return !!url.match(completeUrlRegex);
}

export function haveSameHost(a: string, b: string): boolean {
  const urlA = parseURL(a);
  const urlB = parseURL(b);

  return (
    urlA.protocol === urlB.protocol &&
    urlA.hostname === urlB.hostname &&
    urlA.port === urlB.port
  );
}
