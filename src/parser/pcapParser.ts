import {
  Buf2Num,
} from '../util';
import packetsParser from './packetsParser';

import { PcapResult, PcapBody } from './pcapSchema';

/**
 * LinkType 含义
 */
const LinkTypeMap: { [LinkType: number]: string } = new Proxy<{ [LinkType: number]: string }>({
  0: 'BSD loopback devices, except for later OpenBSD',
  1: 'Ethernet, and Linux loopback devices',
  6: '802.5 Token Ring',
  7: 'ARCnet',
  8: 'SLIP',
  9: 'PPP',
  10: 'FDDI',
  100: 'LLC/SNAP-encapsulated ATM',
  101: '“raw IP”, with no link',
  102: 'BSD/OS SLIP',
  103: 'BSD/OS PPP',
  104: 'Cisco HDLC',
  105: '802.11',
  108: 'later OpenBSD loopback devices (with the AF_value in network byte order)',
  113: 'special Linux “cooked” captur',
  114: 'LocalTalk',
}, {
  get(target, key: number): string {
    const value: string | undefined = Reflect.get(target, key);

    if (typeof value === 'undefined') {
      return `unknow key ${key}`;
    }

    return value;
  },
});

export default function pcapParser(fileBuffer: Uint8Array): PcapResult {
  const Magic: Uint8Array = fileBuffer.subarray(0, 4);

  const order: boolean = Magic.reduce((ret, magic) => ret + magic.toString(16), '') === '1a2b3c4d';
  const { buf2num } = new Buf2Num(order);

  const Major: number = buf2num(fileBuffer.subarray(4, 6));
  const Minor: number = buf2num(fileBuffer.subarray(6, 8));
  const ThisZone: number = buf2num(fileBuffer.subarray(8, 12));
  const SigFigs: number = buf2num(fileBuffer.subarray(12, 16));
  const SnapLen: number = buf2num(fileBuffer.subarray(16, 20));
  const LinkType: string = LinkTypeMap[(buf2num(fileBuffer.subarray(20, 24)))];

  const body: PcapBody = packetsParser(fileBuffer.subarray(24), order);

  return {
    pcapHeaders: {
      Magic,
      order,
      Major,
      Minor,
      ThisZone,
      SigFigs,
      SnapLen,
      LinkType,
    },

    pcapBody: body,
  };
}
