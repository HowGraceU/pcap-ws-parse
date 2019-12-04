export const objectToString = Object.prototype.toString;
export const toTypeString = (value: unknown): string => objectToString.call(value);

/**
 * @param param
 */
export const isPlainObject = (val: unknown): val is object => toTypeString(val) === '[object Object]';
