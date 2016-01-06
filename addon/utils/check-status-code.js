/**
 * Checks if the given status code represents an unauthorized request error
 * @method isUnauthorized
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isUnauthorized(status) {
  return status === 401;
}

/**
 * Checks if the given status code represents a forbidden request error
 * @method isForbidden
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isForbidden(status) {
  return status === 403;
}

/**
 * Checks if the given status code represents an invalid request error
 * @method isInvalid
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isInvalid(status) {
  return status === 422;
}

/**
 * Checks if the given status code represents a bad request error
 * @method isBadRequest
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isBadRequest(status) {
  return status === 400;
}

/**
 * Checks if the given status code represents a server error
 * @method isServerError
 * @public
 * @param {Number} status
 * @return {Boolean}
 */
export function isServerError(status) {
  return status >= 500 && status < 600;
}

/**
 * Checks if the given status code represents a successful request
 * @method isSuccess
 * @public
 * @param  {Number} status
 * @return {Boolean}
 */
export function isSuccess(status) {
  return status >= 200 && status < 300 || status === 304;
}
