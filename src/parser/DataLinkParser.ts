import {
  buf2num,
  buf2Mac,
} from '../util';

import { PacketsWithHeaders, DataLinkSchema, PacketsWithDataLink } from './pcapSchema';

const packetTypeMap: { [LinkType: number]: string } = new Proxy<{ [LinkType: number]: string }>({
  0: 'Unicast to us',
  1: 'Broadcast to us',
  2: 'Multicast, but not broadcast to us',
  3: 'sent to somebody else by somebody else',
  4: 'Sent by us',
}, {
  get(target, key: number): string {
    const value: string | undefined = Reflect.get(target, key);

    if (typeof value === 'undefined') {
      return `unknow key ${key}`;
    }

    return value;
  },
});

const protocolMap: { [LinkType: number]: string } = new Proxy<{ [LinkType: number]: string }>({
  0x0800: 'IPv4',
  0x0806: 'ARP',
  0x8035: 'RARP',
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
 * Data link Layer
 * @param packets
 */
export default function DataLinkParser(packets: PacketsWithHeaders[]): PacketsWithDataLink[] {
  return packets.map<PacketsWithDataLink>((packet) => {
    const {
      packetHeaders,
      packetBody: body,
    } = packet;

    const {
      Caplen,
      Len,
    } = packetHeaders;

    // fixme: 若抓包网卡指定为any时，两个长度不等，是否还有其他方法判断
    const isAny = Caplen - Len !== 0;

    let DataLink: DataLinkSchema;
    let DataLinkHeaderLen;
    if (isAny) {
      const packetType = packetTypeMap[buf2num(body.subarray(0, 2))];
      const LinkLayerAddressType = buf2num(body.subarray(2, 4)); // 1 表示ARPHRD_ETHER
      const LinkLayerAddressLen = buf2num(body.subarray(4, 6));
      const SMac = buf2Mac(body.slice(6, 12));
      const protocol = protocolMap[buf2num(body.subarray(14, 16))];

      DataLinkHeaderLen = 16;
      DataLink = {
        packetType,
        LinkLayerAddressType,
        LinkLayerAddressLen,
        SMac,
        protocol,
        DataLinkHeaderLen: 0,
      };
    } else {
      const DMac = buf2Mac(body.slice(0, 6));
      const SMac = buf2Mac(body.slice(6, 12));
      const protocol = protocolMap[buf2num(body.subarray(12, 14))];

      DataLinkHeaderLen = 14;
      DataLink = {
        DMac,
        SMac,
        protocol,
        DataLinkHeaderLen: 0,
      };
    }

    DataLink.DataLinkHeaderLen = DataLinkHeaderLen;

    const ret: PacketsWithDataLink = {
      ...packet,
      packetBody: {
        DataLink,
        NetWork: body.subarray(DataLinkHeaderLen),
      },
    };
    ret.protocol = DataLink.protocol;
    return ret;
  });
}
