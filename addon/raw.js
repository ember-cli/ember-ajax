import makePromise from './make-promise';
import parseArgs from './utils/parse-args';

/*
 * Same as `request` except it resolves an object with `{response, textStatus,
 * jqXHR}`, useful if you need access to the jqXHR object for headers, etc.
 */
export default function raw() {
  let [ url, type, settings ] = parseArgs.apply(null, arguments);
  if (!settings) {
    settings = {};
  }
  settings.url = url;
  settings.type = type;
  return makePromise(settings);
}
