import AjaxRequest from './ajax-request';

/**
 * Helper function that allows you to use the default `ember-ajax` to make
 * requests without using the service.
 *
 * Note: Unlike `ic-ajax`'s `request` helper function, this will *not* return a
 * jqXHR object in the error handler.  If you need jqXHR, you can use the `raw`
 * function instead.
 *
 * @public
 */
export default function request() {
  const ajax = new AjaxRequest();
  return ajax.request(...arguments);
}
