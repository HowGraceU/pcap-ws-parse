import {
  buf2UTF8,
} from '../util';

import { HTTPReschema } from './pcapSchema';
import HTTPParser from './HTTPParser';

/**
 * @param packet
 */
export default function HTTPResParser(packet: Uint8Array): HTTPReschema {
  const data = buf2UTF8(packet).split('\r\n');

  const firstLine = data.shift() || '';
  const [version, status, ...reasonArr] = firstLine.split(' ');
  const reason = reasonArr.join(' ');

  const HTTPData = HTTPParser(data);

  return {
    version,
    status: parseInt(status, 10),
    reason,
    ...HTTPData,
  };
}
