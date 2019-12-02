const methods = new Set<string>(['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT']);

/**
 * @param {String} method
 * @returns {Boolean}
 */
export default function isHTTPMethod(method: string): boolean {
  return methods.has(method);
}
