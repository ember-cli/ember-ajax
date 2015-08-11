import Ember from 'ember';

const EmberError = Ember.Error;

/**
  @class AjaxError
  @namespace DS
*/
export function AjaxError(errors, message = 'Ajax operation failed') {
  EmberError.call(this, message);

  this.errors = errors || [
    {
      title: 'Ajax Error',
      detail: message
    }
  ];
}

AjaxError.prototype = Object.create(EmberError.prototype);

export function InvalidError(errors) {
  AjaxError.call(this, errors, 'Request was rejected because it was invalid');
}

InvalidError.prototype = Object.create(AjaxError.prototype);

export function UnauthorizedError(errors) {
  AjaxError.call(this, errors, 'Ajax authorization failed');
}

UnauthorizedError.prototype = Object.create(AjaxError.prototype);

export function ForbiddenError(errors) {
  AjaxError.call(this, errors,
    'Request was rejected because user is not permitted to perform this operation.');
}

ForbiddenError.prototype = Object.create(AjaxError.prototype);
