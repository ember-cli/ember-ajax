export default function parseArgs() {
  const args = [].slice.apply(arguments);
  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      const [url] = args;
      return [url];
    } else {
      let [ options ] = args;
      const { url } = options;
      delete options.url;
      const type = options.type || options.method;
      delete options.type;
      delete options.method;
      return [ url, type, options ];
    }
  }
  if (args.length === 2) {
    const [ url ] = args;
    if (typeof args[1] === 'object') {
      let [, options] = args;
      const type = options.type || options.method;
      delete options.type;
      delete options.method;
      return [ url, type, options ];
    } else {
      const [, type] = args;
      return [ url, type ];
    }
  }
  return args;
}
