import {
  buf2UTF8,
} from '../util';

import { HTTPReschema, StrObj } from './pcapSchema';

/**
 * @param packet
 */
export default function HTTPResParser(packet: Uint8Array): HTTPReschema {
  const data = buf2UTF8(packet).split('\r\n');

  const firstLine = data.shift() || '';
  const [version, status, reason] = firstLine.split(' ');
  const responseHeaders: StrObj = {};
  let headerEnd = false;
  let bodyStr = '';

  data.forEach((content) => {
    if (content === '') {
      headerEnd = true;
      return;
    }

    if (!headerEnd) {
      const [key, value] = content.split(':');
      responseHeaders[key.trim()] = value.trim();
    } else {
      bodyStr = content;
    }
  });

  let body: object | string = '';

  /**
   * @type {String}
   */
  const contentType = responseHeaders['Content-Type'];
  if (contentType.includes('application/json')) {
    body = JSON.parse(bodyStr);
  }

  return {
    version,
    status: parseInt(status, 10),
    reason,
    responseHeaders,
    body,
    protocol: 'HTTP',
  };
}
