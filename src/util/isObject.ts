/**
 * @param param
 */
export default function isObject(param: any): param is object {
  return Object.prototype.toString.call(param) === '[object Object]';
}
