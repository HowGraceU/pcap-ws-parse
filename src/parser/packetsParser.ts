import packetheaderParser from './packetheaderParser';
import packetBodyParser from './packetBodyParser';

import { PcapBody } from './pcapSchema';

/**
 * @param packets
 * @param order 16进制读取顺序
 */
export default function packetsParser(packets: Uint8Array, order: boolean): PcapBody {
  const packetsRet = [];

  let packetsBuf = packets;
  let FrameNum = 0;

  while (packetsBuf.length > 0) {
    const packetHeaders = packetheaderParser(packetsBuf.subarray(0, 16), order);
    const {
      Len,
      Caplen,
    } = packetHeaders;

    const packetBody = packetsBuf.subarray(16, 16 + Len);
    FrameNum += 1;

    packetsRet.push({
      packetHeaders,
      packetBody,
      FrameNum,
    });

    packetsBuf = packetsBuf.subarray(16 + Caplen);
  }

  return packetBodyParser(packetsRet);
}
