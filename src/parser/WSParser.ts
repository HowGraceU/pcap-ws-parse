import {
  buf2num,
  buf2UTF8,
  concatBuf,
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

let WSEnd = true;
let WSData: Uint8Array | undefined;

/**
 * @param packet
 */
export default function WSParser(packet: Uint8Array): WSReschema {
  let packetBody = packet;

  if (!WSEnd && typeof WSData !== 'undefined') {
    packetBody = concatBuf(WSData, packetBody);
  }

  const FIN = Boolean(packetBody[0] & 0x80);
  if (!FIN) {
    throw new Error('websocket is not end, FIN is not 1');
  }

  const opcode = opcodeMap[packetBody[0] & 0x0f];
  let useMask = false;
  let payloadLen = 0;
  let realLen = 0;
  let mask: number[] = [];
  let body: Uint8Array = new Uint8Array();
  let data: string | object = '';

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

    body = packetBody.subarray(0, 0 + realLen);

    const bodyString = buf2UTF8(body.map((byte, index) => byte ^ mask[index % 4]));
    try {
      data = JSON.parse(bodyString);
    } catch {
      data = bodyString;
    }
  }

  if (realLen === packetBody.length) {
    WSEnd = true;
    WSData = undefined;
  } else {
    WSEnd = false;
    WSData = Uint8Array.from(packet);
  }

  return {
    FIN,
    opcode,
    payloadLen,
    realLen,
    useMask,
    mask: mask.map((byte) => byte.toString(16)).join(' '),
    body: data,
    protocol: 'websocket',
  };
}
