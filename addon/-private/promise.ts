import RSVP, { Promise } from 'rsvp';

/**
 * AJAX Promise
 *
 * Sub-class of RSVP Promise that passes the XHR property on to the
 * child promise
 *
 * @extends RSVP.Promise
 * @private
 */
export default class AJAXPromise<T> extends Promise<T> {
  xhr?: JQueryXHR;

  // NOTE: Only necessary due to broken definition of RSVP.Promise
  // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/26640
  constructor(
    executor: (
      resolve: (value?: RSVP.Arg<T>) => void,
      reject: (reason?: any) => void
    ) => void,
    label?: string
  ) {
    super(executor, label);
  }

  /**
   * Overriding `.then` to add XHR to child promise
   */
  then<TResult1 = T, TResult2 = never>(
    onFulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onRejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
    label?: string
  ): AJAXPromise<TResult1 | TResult2> {
    const child = super.then(onFulfilled, onRejected, label);

    (child as AJAXPromise<TResult1 | TResult2>).xhr = this.xhr;

    return child;
  }
}
