/**
 * @param buf1
 * @param buf2
 */
export default function buf2UTF8(buf1: Uint8Array, buf2: Uint8Array): Uint8Array {
  const ret: Uint8Array = new Uint8Array(buf1.length + buf2.length);
  ret.set(buf1, 0);
  ret.set(buf2, buf1.length);
  return ret;
}
