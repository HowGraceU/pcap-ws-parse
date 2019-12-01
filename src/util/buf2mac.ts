/**
 * @param buf
 */
export default function buf2Mac(buf: Uint8Array): string {
  return Array.from(buf).map((byte) => byte.toString(16)).join(':');
}
