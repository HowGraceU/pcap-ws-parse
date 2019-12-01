
import pcapParser, { PcapResult } from './parser/pcapParser';

export default function parser(fileBuffer: Uint8Array): PcapResult {
  return pcapParser(fileBuffer);
}
