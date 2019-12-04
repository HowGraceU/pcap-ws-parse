import { resolve } from 'path';
import fs from 'fs';
import parser from '../src/index';
import { HTTPReqchema, HTTPReschema } from '../src/parser/pcapSchema';

describe('checked HTTP parse', () => {
  const fileName = './pcap/HTTP.pcap';
  const fileBuf = fs.readFileSync(fileName);
  const pcapResult = parser(fileBuf);

  const httpPackets = pcapResult.pcapBody.filter((packet) => packet.protocol === 'HTTP');

  it('checked HTTP data', () => {
    expect(httpPackets).toHaveLength(104);

    const httpData = httpPackets.reduce<{ [key: number]: string | object }>((pre, pac) => {
      const ret = pre;
      ret[pac.FrameNum] = (pac.packetBody.Application as HTTPReqchema | HTTPReschema).body; return ret;
    }, {});

    const expectData = JSON.parse(fs.readFileSync(resolve(__dirname, './httpData.json'), 'utf-8'));

    expect(httpData).toMatchObject(expectData);
  });
});
