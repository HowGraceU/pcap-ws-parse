import fs from 'fs';
import { resolve } from 'path';
import parser from '../src/index';
import { WSReschema } from '../src/parser/pcapSchema';

describe('checked websocket parse', () => {
  const fileName = './pcap/ws.pcap';
  const fileBuf = fs.readFileSync(fileName);
  const pcapResult = parser(fileBuf);

  const wsPackets = pcapResult.pcapBody.filter((packet) => packet.protocol === 'websocket');

  it('checked websocket data', () => {
    expect(wsPackets).toHaveLength(8);

    const expectData = JSON.parse(fs.readFileSync(resolve(__dirname, './wsData.json'), 'utf-8'));
    const wsData = wsPackets.map((p) => (p.packetBody.Application as WSReschema).body);

    expect(wsData).toMatchObject(expectData);
  });
});
