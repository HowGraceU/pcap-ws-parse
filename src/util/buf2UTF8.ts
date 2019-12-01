/**
 * @param buf
 */
export default function buf2UTF8(buf: Uint8Array): string {
  // let uint8array = new TextEncoder('utf-8').encode('¢');
  const string = new TextDecoder('utf-8').decode(buf);
  return string;
}
