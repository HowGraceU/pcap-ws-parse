import {
  buf2UTF8,
  isHTTPMethod,
} from '../util';

const HTTPReqParser = require('./HTTPReqParser');
const HTTPResParser = require('./HTTPResParser');
const WSParser = require('./WSParser');

/**
 * Application Layer
 * @param {{packetHeaders, packetBody, FrameNum: Number}[]} packets
 */
module.exports = function ApplicationParser(packets) {
  packets.forEach((packet) => {
    const { packetBody } = packet;
    const { NetWork: { protocol }, Application: body } = packetBody;

    if (protocol === 'TCP') {
      try {
        if (body.length === 0) {
          return;
        }

        const method = buf2UTF8(body.subarray(0, 4));
        if (isHTTPMethod(method)) {
          packetBody.Application = HTTPReqParser(body);
          return;
        } if (method === 'HTTP') {
          packetBody.Application = HTTPResParser(body);
          return;
        }
        packetBody.Application = WSParser(body);


        packet.protocol = packetBody.Application.protocol;
      } catch (e) {
        // console.log(e);
        packetBody.Application = {
          body,
          errMsg: e.message,
        };
      }
    }
  });

  return packets;
};
