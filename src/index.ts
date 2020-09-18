import pcapParser from './parser/pcapParser';

import { PcapResult } from './parser/pcapSchema';

export default function parser(fileBuffer: Uint8Array): PcapResult {
  return pcapParser(fileBuffer);
}
