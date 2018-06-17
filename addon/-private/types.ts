import { AjaxError } from '../errors';

export interface Headers {
  [key: string]: string | undefined | null;
}

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export interface AJAXOptions extends JQueryAjaxSettings {
  host?: string;
  namespace?: string;
}

export interface RequestData {
  method: string;
  type: string;
  url?: string;
}

export type Matcher = string | RegExp;

export type Response = any;

export interface RawResponse<T = Response> {
  response: T;
  jqXHR: JQueryXHR;
  payload: object;
  textStatus: string;
}

export interface RawErrorResponse extends RawResponse {
  response: AjaxError;
  errorThrown?: string;
}
