/**
 * @param buf
 */
export default function buf2Hex(buf: Uint8Array): string {
  return Array.from(buf).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
