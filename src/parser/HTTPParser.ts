/**
 * 解析 HTTP 协议除了第一行以外的内容 headers 和 body
 */

import { UTF82buf } from '../util';

import { HTTPSchema, StrObj } from './pcapSchema';

export default function HTTPParser(data: string[]): HTTPSchema {
  const headers: StrObj = {};
  let headerEnd = false;
  let bodyStr = '';

  data.some((content, index) => {
    if (content === '') {
      headerEnd = true;
      bodyStr = data.slice(index + 1).join('\r\n');
      return true;
    }

    if (!headerEnd) {
      const [key, value] = content.split(':');
      headers[key.trim()] = value.trim();
    }
    return false;
  });

  let body: object | string | Uint8Array = bodyStr;

  const bodyLen = parseInt(headers['Content-Length'], 10);
  let stick = false;
  let bodyBufLen = 0;
  if (Number.isInteger(bodyLen)) {
    const bodyBuf = UTF82buf(body);
    bodyBufLen = bodyBuf.length;
    if (bodyLen === bodyBufLen) {
      const contentType: string | undefined = headers['Content-Type'];
      if (contentType && contentType.includes('application/json')) {
        body = JSON.parse(bodyStr);
      }
    } else if (bodyLen > bodyBufLen) {
      stick = true;
      body = bodyBuf;
    }
  }

  const ret: HTTPSchema = {
    headers,
    body,
    protocol: 'HTTP',
  };

  if (stick) {
    ret.stick = true;
    ret.bodyLen = bodyLen;
  }

  return ret;
}
