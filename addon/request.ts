import AjaxRequest from './ajax-request';

import { AJAXOptions, Response } from './-private/types';
import AJAXPromise from 'ember-ajax/-private/promise';

/**
 * Helper function that allows you to use the default `ember-ajax` to make
 * requests without using the service.
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
