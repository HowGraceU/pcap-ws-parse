import {
  Buf2Num,
} from '../util';

import { PacketHeaders } from './pcapSchema';

/**
 *
 * @param packetHeader
 * @param order 16进制读取顺序
 */
export default function packetHeaderParser(packetHeader: Uint8Array, order: boolean): PacketHeaders {
  const { buf2num } = new Buf2Num(order);

  const timestampHigh: number = buf2num(packetHeader.subarray(0, 4));
  const timestampLow: number = buf2num(packetHeader.subarray(4, 8));
  const Caplen: number = buf2num(packetHeader.subarray(8, 12));
  const Len: number = buf2num(packetHeader.subarray(12, 16));

  return {
    timestampHigh,
    timestampLow,
    Caplen,
    Len,
  };
}
