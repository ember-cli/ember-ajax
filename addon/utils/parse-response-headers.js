export default function parseResponseHeaders(headerStr) {
  const headers = Object.create(null);
  if (!headerStr) {
    return headers;
  }

  const headerPairs = headerStr.split('\u000d\u000a');
  for (let i = 0; i < headerPairs.length; i++) {
    const headerPair = headerPairs[i];
    // Can't use split() here because it does the wrong thing
    // if the header value has the string ": " in it.
    const index = headerPair.indexOf('\u003a\u0020');
    if (index > 0) {
      const key = headerPair.substring(0, index);
      const val = headerPair.substring(index + 2);
      headers[key] = val;
    }
  }

  return headers;
}
