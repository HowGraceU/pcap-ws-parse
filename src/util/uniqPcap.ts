import { PacketsWithTransport } from '../parser/pcapSchema';

/**
 * @type 存在唯一 NetworkId(网络层id)_tcpSeq 和 抓包对象
 */
export default new Map<string, PacketsWithTransport>();
