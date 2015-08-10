import Ember from 'ember';
const {deprecate} = Ember;

export default function parseArgs() {
  const args = [].slice.apply(arguments);
  if (args.length === 1) {
    if (typeof args[0] === "string") {
      const [url] = args;
      return [url];
    } else {
      deprecate('Passing settings hash as only argument to ember-ajax/raw is deprecated', false, {
        id: 'ember-ajax.raw.arguments.settings'
      });
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
      deprecate('Passing settings hash to second argument of ember-ajax/raw is deprecated', false, {
        id: 'ember-ajax.raw.arguments.2nd.hash'
      });
      let options = args[1];
      const type = options.type || options.method;
      delete options.type;
      delete options.method;
      return [ url, type, options ];
    } else {
      const type = args[1];
      return [ url, type ];
    }
  }
  return args;
}
