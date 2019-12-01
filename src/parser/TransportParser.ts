import {
  buf2num,
  buf2Hex,
  uniqPcap,
} from '../util';

import {
  PacketsWithNetwork, TransportSchema, PacketsWithTransport,
} from './pcapSchema';

const firstSeqMap = new Map();
const firstAckMap = new Map();

/**
 * @param packetBody
 */
function TCPParser(packet: PacketsWithNetwork): {Transport: TransportSchema; Application: Uint8Array} {
  const { packetBody: { NetWork: { SIP }, Transport: body } } = packet;
  const SPort = buf2num(body.subarray(0, 2));
  const DPort = buf2num(body.subarray(2, 4));

  const SID = `${SIP}:${SPort}`;
  const SeqNum = buf2num(body.subarray(4, 8));
  const firstSeq = firstSeqMap.get(SID);
  let relativeSeq;
  if (!firstSeq) {
    firstSeqMap.set(SID, SeqNum - 1);
    relativeSeq = 1;
  } else {
    relativeSeq = SeqNum - firstSeq;
  }

  const AckNum = buf2num(body.subarray(8, 12));
  const firstAck = firstAckMap.get(SID);
  let relativeAck;
  if (!firstAck) {
    firstAckMap.set(SID, AckNum - 1);
    relativeAck = 1;
  } else {
    relativeAck = AckNum - firstAck;
  }

  const TransportHeaderLen = ((body[12] & 0xf0) >> 4) * 4;
  const flagByte = body[13];
  const flags = {
    CWR: Boolean(flagByte & 0x80),
    ECE: Boolean(flagByte & 0x40),
    URG: Boolean(flagByte & 0x20),
    ACK: Boolean(flagByte & 0x10),
    PSH: Boolean(flagByte & 0x08),
    RST: Boolean(flagByte & 0x04),
    SYN: Boolean(flagByte & 0x02),
    FIN: Boolean(flagByte & 0x01),
  };
  const windowSize = buf2num(body.subarray(14, 16));
  const Checksum = buf2num(body.subarray(16, 18));
  const UrgentPointer = buf2num(body.subarray(18, 20));
  const option = buf2Hex(body.subarray(20, TransportHeaderLen));

  const Transport: TransportSchema = {
    SPort,
    DPort,
    SeqNum,
    relativeSeq,
    AckNum,
    relativeAck,
    TransportHeaderLen,
    flags,
    windowSize,
    Checksum,
    UrgentPointer,
    option,
  };

  return {
    Transport,
    Application: body.subarray(TransportHeaderLen),
  };
}

/**
 * @param {Buffer} packetBody
 */
function UDPParser(packet: PacketsWithNetwork): {Transport: TransportSchema; Application: Uint8Array} {
  const { packetBody: { Transport: body } } = packet;
  const SPort = buf2num(body.subarray(0, 2));
  const DPort = buf2num(body.subarray(2, 4));
  const UDPLen = buf2num(body.subarray(4, 6));
  const Checksum = buf2num(body.subarray(6, 8));

  const Transport: TransportSchema = {
    SPort,
    DPort,
    UDPLen,
    Checksum,
  };
  return {
    Transport,
    Application: body.subarray(8),
  };
}


// 服务类型
const parserMap: { [LinkType: string]: Function } = new Proxy<{ [LinkType: string]: Function }>({
  TCP: TCPParser,
  UDP: UDPParser,
}, {
  get(target, key: string): Function {
    const fn = Reflect.get(target, key);

    if (typeof fn === 'undefined') {
      return <T>(buf: T): T => buf;
    }

    return fn;
  },
});


/**
 * Transport Layer
 * @param packets
 */
export default function TransportParser(packets: PacketsWithNetwork[]): PacketsWithTransport[] {
  return packets.map<PacketsWithTransport>((packet) => {
    const { packetBody } = packet;
    const { NetWork: { protocol } } = packetBody;

    const parser = parserMap[protocol];
    const { Transport, Application } = parser(packet);

    return {
      ...packet,
      packetBody: {
        ...packet.packetBody,
        Transport,
        Application,
      },
    };
  }).filter((packet) => {
    const { packetBody } = packet;
    const { NetWork: { protocol, SIP, id } } = packetBody;
    const {
      Transport: {
        SPort,
        SeqNum,
        AckNum,
      },
    } = packetBody;

    if (protocol === 'TCP') {
      const uniqKey = `${id}_${SIP}_${SPort}_${SeqNum}_${AckNum}`;
      const lastPacket = uniqPcap.get(uniqKey);
      if (lastPacket) {
        const { retransmission } = lastPacket;
        if (Array.isArray(retransmission)) {
          retransmission.push(packet);
        } else {
          lastPacket.retransmission = [packet];
        }
        return false;
      }
      uniqPcap.set(uniqKey, packet);
      return true;
    }
    return true;
  });
}
