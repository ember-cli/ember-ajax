import AjaxRequest from './ajax-request';

import { AJAXOptions, Response } from './-private/types';
import AJAXPromise from 'ember-ajax/-private/promise';

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
export default function request<T = Response>(
  url: string,
  options?: AJAXOptions
): AJAXPromise<T> {
  const ajax = new AjaxRequest();

  return ajax.request(url, options);
}
