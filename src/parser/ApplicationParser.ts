import {
  buf2UTF8,
  isHTTPMethod,
} from '../util';

import HTTPReqParser from './HTTPReqParser';
import HTTPResParser from './HTTPResParser';
import WSParser from './WSParser';

import {
  PacketsWithTransport, PcapBodySchema, ApplicationSchema, HTTPReqchema, HTTPReschema, WSReschema,
} from './pcapSchema';

/**
 * 存放 ip:port 对应的有粘连的包和长度
 */
const stickMap = new Map<string, { offset: number; buf: Uint8Array; pacp: PcapBodySchema; sticks: number[] }>();

/**
 * Application Layer
 * @param packets
 */
export default function ApplicationParser(packets: PacketsWithTransport[]): PcapBodySchema[] {
  packets.sort((packetA, packetB) => {
    const seqA = packetA.packetBody.Transport.SeqNum || 0;
    const seqB = packetB.packetBody.Transport.SeqNum || 0;

    return seqA - seqB;
  });

  const retPackets = packets.reduce((packetsArray, packet) => {
    const { packetBody } = packet;
    const { NetWork: { protocol, SIP }, Transport: { SPort, AckNum } } = packetBody;
    const key = `${SIP}:${SPort}_${AckNum}`;
    const stickPcap = stickMap.get(key);
    let { Application: body } = packetBody;

    // 保存粘包
    if (stickPcap) {
      const {
        offset, buf, pacp: { packetBody: { Application: stickApplication } }, sticks,
      } = stickPcap;

      sticks.push(packet.FrameNum);
      buf.set(body.subarray(0, buf.length - offset), offset);
      stickPcap.offset += body.length;

      const ret: PcapBodySchema = {
        ...packet,
        packetBody: {
          ...packet.packetBody,
          Application: {
            ...stickApplication,
          },
        },
      };

      let retBody: string | object | Uint8Array;
      if (stickPcap.offset >= buf.length) {
        ret.sticks = sticks;
        stickMap.delete(key);

        if ('protocol' in stickApplication) {
          ret.protocol = stickApplication.protocol;
          if (stickApplication.protocol === 'HTTP') {
            retBody = buf2UTF8(buf);
          } else {
            const { mask } = stickApplication;
            retBody = buf2UTF8(buf.map((byte, index) => byte ^ mask[index % 4]));
          }

          try {
            retBody = JSON.parse(retBody);
          } catch (e) {
            // console.log(e);
          }
        } else {
          retBody = buf;
        }
      } else {
        retBody = body;
      }
      (ret.packetBody.Application as HTTPReqchema | HTTPReschema | WSReschema).body = retBody;

      packetsArray.push(ret);

      if (stickPcap.offset > buf.length) {
        body = body.subarray(buf.length - offset);
      } else {
        return packetsArray;
      }
    }

    let Application: ApplicationSchema[] | undefined;

    if (protocol === 'TCP' && body.length !== 0) {
      try {
        const method = buf2UTF8(body.subarray(0, 4));
        if (isHTTPMethod(method)) {
          Application = HTTPReqParser(body);
        } else if (method === 'HTTP') {
          Application = HTTPResParser(body);
        } else { // ws
          Application = WSParser(body);
        }
      } catch (e) {
        // console.log(e);
        Application = [{
          body,
          errMsg: e.message,
        }];
      }
    }

    if (typeof Application !== 'undefined') {
      Application.forEach((app) => {
        const ret: PcapBodySchema = {
          ...packet,
          packetBody: {
            ...packet.packetBody,
            Application: app,
          },
        };

        if ('protocol' in app) {
          // 若存在粘包，则设置全局变量 stickMap
          if (app.stick) {
            const sticks = [ret.FrameNum];
            const buf = new Uint8Array(app.bodyLen as number);
            buf.set((app.body as Uint8Array), 0);
            stickMap.set(key, {
              offset: (app.body as Uint8Array).length,
              buf,
              pacp: ret,
              sticks,
            });
          } else {
            ret.protocol = app.protocol;
          }
        }

        packetsArray.push(ret);
      });

      return packetsArray;
    }

    packetsArray.push(packet);

    return packetsArray;
  }, [] as PcapBodySchema[]);

  return retPackets.sort((packetA, packetB) => {
    const FrameNumA = packetA.FrameNum;
    const FrameNumB = packetB.FrameNum;

    return FrameNumA - FrameNumB;
  });
}
