import fs from 'fs';
import parser from '../src/index';

describe('checked result', () => {
  const fileName = './pcap/ws.pcap';
  const fileBuf = fs.readFileSync(fileName);
  const pcapResult = parser(fileBuf);

  it('result schame', () => {
    expect(Reflect.has(pcapResult, 'pcapHeaders')).toBe(true);
    expect(Reflect.has(pcapResult, 'pcapBody')).toBe(true);
  });
});
