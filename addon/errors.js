import Ember from 'ember';

const EmberError = Ember.Error;

/**
 * @class AjaxError
 * @private
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

/**
 * @class InvalidError
 * @public
 */
export function InvalidError(errors) {
  AjaxError.call(this, errors, 'Request was rejected because it was invalid');
}

InvalidError.prototype = Object.create(AjaxError.prototype);

/**
 * @class UnauthorizedError
 * @public
 */
export function UnauthorizedError(errors) {
  AjaxError.call(this, errors, 'Ajax authorization failed');
}

UnauthorizedError.prototype = Object.create(AjaxError.prototype);

/**
 * @class ForbiddenError
 * @public
 */
export function ForbiddenError(errors) {
  AjaxError.call(this, errors,
    'Request was rejected because user is not permitted to perform this operation.');
}

ForbiddenError.prototype = Object.create(AjaxError.prototype);

/**
 * @class BadRequestError
 * @public
 */
export function BadRequestError(errors) {
  AjaxError.call(this, errors, 'Request was formatted incorrectly.');
}

BadRequestError.prototype = Object.create(AjaxError.prototype);

/**
 * @class ServerError
 * @public
 */
export function ServerError(errors) {
  AjaxError.call(this, errors, 'Request was rejected due to server error');
}

ServerError.prototype = Object.create(AjaxError.prototype);
