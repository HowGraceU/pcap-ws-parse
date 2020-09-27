import {
  buf2UTF8,
} from '../util';

import { HTTPReqchema } from './pcapSchema';
import HTTPParser from './HTTPParser';

/**
 * @param packet
 */
export default function HTTPReqParser(packet: Uint8Array): HTTPReqchema[] {
  const data = buf2UTF8(packet).split('\r\n');

  const firstLine = data.shift() || '';
  const [method, url, version] = firstLine.split(' ');

  const HTTPData = HTTPParser(data);

  return [{
    method,
    url,
    version,
    ...HTTPData,
  }];
}
