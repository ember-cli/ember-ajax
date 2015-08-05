import Ember from 'ember';

const {
  run,
  RSVP
} = Ember;

export default function makePromise(settings) {
  return new RSVP.Promise(function(resolve, reject) {
    settings.success = makeSuccess(resolve);
    settings.error = makeError(reject);
    Ember.$.ajax(settings);
  }, 'ember-ajax: ' + (settings.type || 'GET') + ' to ' + settings.url);
};

function makeSuccess(resolve) {
  return function(response, textStatus, jqXHR) {
    run(null, resolve, {
      response: response,
      textStatus: textStatus,
      jqXHR: jqXHR
    });
  }
}

function makeError(reject) {
  return function(jqXHR, textStatus, errorThrown) {
    run(null, reject, {
      jqXHR: jqXHR,
      textStatus: textStatus,
      errorThrown: errorThrown
    });
  };
}
