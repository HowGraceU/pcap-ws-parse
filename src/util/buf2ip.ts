/**
 * @param buf
 */
export default function buf2IP(buf: Uint8Array): string {
  return buf.join('.');
}
