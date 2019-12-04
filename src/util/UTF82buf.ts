/**
 * @param string
 */
export default function buf2UTF8(string: string): Uint8Array {
  const buf = new TextEncoder().encode(string);
  return buf;
}
