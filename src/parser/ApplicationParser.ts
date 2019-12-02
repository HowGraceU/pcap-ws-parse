import {
  buf2UTF8,
  isHTTPMethod,
} from '../util';

import HTTPReqParser from './HTTPReqParser';
import HTTPResParser from './HTTPResParser';
import WSParser from './WSParser';

import { PacketsWithTransport, PcapBodySchema, ApplicationSchema } from './pcapSchema';

/**
 * Application Layer
 * @param packets
 */
export default function ApplicationParser(packets: PacketsWithTransport[]): (PacketsWithTransport | PcapBodySchema)[] {
  return packets.map((packet) => {
    const { packetBody } = packet;
    const { NetWork: { protocol }, Application: body } = packetBody;

    let Application: ApplicationSchema | undefined;

    if (protocol === 'TCP' && body.length !== 0) {
      try {
        const method = buf2UTF8(body.subarray(0, 4));
        if (isHTTPMethod(method)) {
          Application = HTTPReqParser(body);
        } if (method === 'HTTP') {
          Application = HTTPResParser(body);
        } else { // ws
          Application = WSParser(body);
        }
      } catch (e) {
        // console.log(e);
        Application = {
          body,
          errMsg: e.message,
          protocol: undefined,
        };
      }
    }

    if (typeof Application !== 'undefined') {
      const ret: PcapBodySchema = {
        ...packet,
        packetBody: {
          ...packet.packetBody,
          Application,
        },
      };

      const { protocol: ApplicationProtocol } = Application;
      if (ApplicationProtocol) {
        ret.protocol = ApplicationProtocol;
      }

      return ret;
    }
    return packet;
  });
}
