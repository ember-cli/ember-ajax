import Ember from 'ember';

const { RSVP: { Promise } } = Ember;

/**
 * AJAX Promise
 *
 * Sub-class of RSVP Promise that passes the XHR property on to the
 * child promise
 *
 * @extends RSVP.Promise
 * @private
 */
export default class AJAXPromise extends Promise {

  /**
   * Overriding `.then` to add XHR to child promise
   *
   * @public
   * @return {AJAXPromise} child promise
   */
  then() {
    const child = super.then(...arguments);

    child.xhr = this.xhr;

    return child;
  }
}
