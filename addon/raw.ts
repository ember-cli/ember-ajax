import AjaxRequest from './ajax-request';
import AJAXPromise from 'ember-ajax/-private/promise';
import { Response, RawResponse, AJAXOptions } from './-private/types';

/**
 * Same as `request` except it resolves an object with
 *
 *   {response, textStatus, jqXHR}
 *
 * Useful if you need access to the jqXHR object for headers, etc.
 *
 * @public
 */
export default function raw<T = Response>(
  url: string,
  options?: AJAXOptions
): AJAXPromise<RawResponse<T>> {
  const ajax = AjaxRequest.create();

  return ajax.raw(url, options);
}
