import {
  buf2UTF8,
} from '../util';

import { HTTPReqchema, StrObj } from './pcapSchema';

/**
 * @param packet
 */
export default function HTTPReqParser(packet: Uint8Array): HTTPReqchema {
  const data = buf2UTF8(packet).split('\r\n');

  const firstLine = data.shift() || '';
  const [method, url, version] = firstLine.split(' ');
  const requestHeaders: StrObj = {};
  let headerEnd = false;
  let bodyStr = '';

  data.forEach((content) => {
    if (content === '') {
      headerEnd = true;
      return;
    }

    if (!headerEnd) {
      const [key, value] = content.split(':');
      requestHeaders[key.trim()] = value.trim();
    } else {
      bodyStr = content;
    }
  });

  let body: object | string = '';

  /**
   * @type {String}
   */
  const contentType = requestHeaders['Content-Type'];
  if (contentType.includes('application/json')) {
    body = JSON.parse(bodyStr);
  }

  return {
    method,
    url,
    version,
    requestHeaders,
    body,
    protocol: 'HTTP',
  };
}
