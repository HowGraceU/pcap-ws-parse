import {
  buf2num,
  buf2IP,
  buf2Hex,
} from '../util';

import { PacketsWithDataLink, NetworkSchame, PacketsWithNetwork } from './pcapSchema';

// 服务类型
const servicesFidleMap: { [LinkType: number]: string } = new Proxy<{ [LinkType: number]: string }>({
  // 最小延迟
  0b1000: 'minimize delay',
  // 最大吞吐量
  0b0100: 'maximize throughput',
  // 最高可靠性
  0b0010: 'maximize reliability',
  // 最小费用
  0b0001: 'minimize monetary cost',
  // 一般服务
  0b0000: 'normal service',
}, {
  get(target, key: number): string {
    const value: string | undefined = Reflect.get(target, key);

    if (typeof value === 'undefined') {
      return `unknow key ${key}`;
    }

    return value;
  },
});

// 协议类型
const protocolMap: { [LinkType: number]: string } = new Proxy<{ [LinkType: number]: string }>({
  0x01: 'ICMP',
  0x02: 'IGMP',
  0x06: 'TCP',
  0x11: 'UDP',
  0x58: 'IGRP',
  0x59: 'OSPF',
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
 * Network Layer
 * @param packets
 */
export default function NetworkParser(packets: PacketsWithDataLink[]): PacketsWithNetwork[] {
  return packets.map((packet) => {
    const {
      packetBody: {
        NetWork: body,
      },
    } = packet;

    const version = (body[0] & 0xf0) >> 4;
    const NetworkHeaderLen = (body[0] & 0x0f) * 4;
    const servicesFidle = servicesFidleMap[(body[1] & 0b00011110) >> 1];
    const NetworkTotalLen = buf2num(body.subarray(2, 4));
    const id = buf2num(body.subarray(4, 6));
    const dontFragment = Boolean(body[6] & 0x40);
    const moreFragment = Boolean(body[6] & 0x20);
    const fragmentOffset = buf2num(Uint8Array.of(body[6] & 0x1f, body[7]));
    const timeToLive = body[8];
    const protocol = protocolMap[body[9]];
    const headerChecksum = `0x${buf2Hex(body.subarray(10, 12))}`;
    const SIP = buf2IP(body.subarray(12, 16));
    const DIP = buf2IP(body.subarray(16, 20));

    const NetWork: NetworkSchame = {
      version,
      NetworkHeaderLen,
      servicesFidle,
      NetworkTotalLen,
      id,
      dontFragment,
      moreFragment,
      fragmentOffset,
      timeToLive,
      protocol,
      headerChecksum,
      SIP,
      DIP,
    };

    return {
      ...packet,
      packetBody: {
        ...packet.packetBody,
        NetWork,
        Transport: body.subarray(NetworkHeaderLen),
      },
    };
  });
}
