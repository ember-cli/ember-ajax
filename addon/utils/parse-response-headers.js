import isFastBoot from './is-fastboot';

const CLRF = isFastBoot ? '\n' : '\u000d\u000a';

export default function parseResponseHeaders(headersString) {
  let headers = {};

  if (!headersString) {
    return headers;
  }

  let headerPairs = headersString.split(CLRF);

  headerPairs.forEach((header) => {
    let [field, ...value] = header.split(':');

    field = field.trim();
    value = value.join(':').trim();

    if (value) {
      headers[field] = value;
    }
  });

  return headers;
}
