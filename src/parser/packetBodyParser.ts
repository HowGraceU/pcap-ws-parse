import DataLinkParser from './DataLinkParser';
import NetWorkParser from './NetWorkParser';
import TransportParser from './TransportParser';
import ApplicationParser from './ApplicationParser';

import { PcapBody, PacketsWithHeaders } from './pcapSchema';

/**
 * 传入所有的包，将每个包的body解析
 * @param packets
 */
export default function packetBodyParser(packets: PacketsWithHeaders[]): PcapBody {
  let packetsRet: any = packets;

  packetsRet = DataLinkParser(packets);

  packetsRet = NetWorkParser(packetsRet);

  packetsRet = TransportParser(packetsRet);

  packetsRet = ApplicationParser(packetsRet);

  return packetsRet;
}
