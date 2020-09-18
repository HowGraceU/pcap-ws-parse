import {
  buf2num,
  buf2UTF8,
} from '../util';

import { WSReschema } from './pcapSchema';

// opcode类型
const opcodeMap: { [LinkType: number]: string } = new Proxy<{ [LinkType: number]: string }>({
  0x00: 'continuation frame',
  0x01: 'text frame',
  0x02: 'binary frame',
  0x08: 'close frame',
  0x09: 'ping frame',
  0x0a: 'pong frame',
}, {
  get(target, key: number): string {
    const value: string | undefined = Reflect.get(target, key);

    if (typeof value === 'undefined') {
      return `unknow key ${key}`;
    }

    return value;
  },
});

/**
 * @param packet
 */
export default function WSParser(packet: Uint8Array): WSReschema {
  let packetBody = packet;

  const FIN = Boolean(packetBody[0] & 0x80);
  if (!FIN) {
    throw new Error('websocket is not end, FIN is not 1');
  }

  const opcode = opcodeMap[packetBody[0] & 0x0f];
  let useMask = false;
  let payloadLen = 0;
  let realLen = 0;
  let mask: number[] = [];
  let body: object | string | Uint8Array = new Uint8Array();
  let stick = false;
  let bodyLen = 0;

  if (opcode === 'text frame') {
    useMask = Boolean(packetBody[1] & 0x80);
    payloadLen = packetBody[1] & 0x7f;

    switch (payloadLen) {
      case 126: {
        realLen = buf2num(packetBody.subarray(2, 4));
        packetBody = packetBody.subarray(4);
        break;
      }

      case 127: {
        realLen = buf2num(packetBody.subarray(2, 10));
        packetBody = packetBody.subarray(10);
        break;
      }

      default: {
        realLen = payloadLen;
        packetBody = packetBody.subarray(2);
        break;
      }
    }

    if (useMask) {
      mask = Array.from(packetBody.subarray(0, 4));

      packetBody = packetBody.subarray(4);
    }

    const bodyBuf = packetBody.subarray(0, 0 + realLen);
    const bodyBufLen = bodyBuf.length;

    if (realLen === bodyBufLen) {
      const bodyString = buf2UTF8(bodyBuf.map((byte, index) => byte ^ mask[index % 4]));
      try {
        body = JSON.parse(bodyString);
      } catch {
        body = bodyString;
      }
    } else if (realLen > bodyBufLen) {
      stick = true;
      body = packetBody;

      const WSHeaderLen = packetBody.length - bodyBuf.length;
      bodyLen = WSHeaderLen + realLen;
    }
  }

  const ret: WSReschema = {
    FIN,
    opcode,
    payloadLen,
    realLen,
    useMask,
    mask,
    body,
    protocol: 'websocket',
  };

  if (stick) {
    ret.stick = true;
    ret.bodyLen = bodyLen;
  }

  return ret;
}
