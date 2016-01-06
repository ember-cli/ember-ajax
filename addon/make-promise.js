import Ember from 'ember';

const {
  run,
  RSVP
} = Ember;

export default function makePromise(settings) {
  const type = settings.type || 'GET';
  return new RSVP.Promise(function(resolve, reject) {
    settings.success = makeSuccess(resolve);
    settings.error = makeError(reject);
    Ember.$.ajax(settings);
  }, `ember-ajax: ${type} to ${settings.url}`);
}

function makeSuccess(resolve) {
  return function success(response, textStatus, jqXHR) {
    run(null, resolve, { response, textStatus, jqXHR });
  };
}

function makeError(reject) {
  return function error(jqXHR, textStatus, errorThrown) {
    run(null, reject, { jqXHR, textStatus, errorThrown });
  };
}
