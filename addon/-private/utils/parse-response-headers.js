export const CRLF = '\u000d\u000a';

export default function parseResponseHeaders(headersString) {
  const headers = {};

  if (!headersString) {
    return headers;
  }

  return headersString.split(CRLF).reduce((hash, header) => {
    let [field, ...value] = header.split(':');

    field = field.trim();
    value = value.join(':').trim();

    if (value) {
      hash[field] = value;
    }

    return hash;
  }, headers);
}
