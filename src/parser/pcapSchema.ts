export declare interface PcapResult {
  pcapHeaders: PcapHeaders;
  pcapBody: PcapBody;
}

/**
 * @type pcapHeader
 * @param Magic 0×1A 2B 3C 4D:用来识别文件自己和字节顺序。
 * 0xa1b2c3d4用来表示按照原来的顺序读取，0xd4c3b2a1表示下面的字节都要交换顺序读取
 * @param order 是否倒序
 * @param Major 当前文件主要的版本号
 * @param Minor 当前文件次要的版本号
 * @param ThisZone 时区。GMT和本地时间的相差，用秒来表示。
 * 如果本地的时区是GMT，那么这个值就设置为0.这个值一般也设置为0 SigFigs：4B时间戳的精度；全零
 * @param SigFigs 时间戳的精度；全零,毫秒
 * @param SnapLen 最大的存储长度（该值设置所抓获的数据包的最大长度。
 * 如果所有数据包都要抓获，将该值设置为65535； 例如：想获取数据包的前64字节，可将该值设置为64）
 * @param LinkType 链路类型
 */
interface PcapHeaders {
  Magic: Uint8Array;
  order: boolean;
  Major: number;
  Minor: number;
  ThisZone: number;
  SigFigs: number;
  SnapLen: number;
  LinkType: string;
}

export declare type PcapBody = PcapBodySchema[];

export declare interface PcapBodySchema {
  packetHeaders: PacketHeaders;
  packetBody: PacketBody;
  FrameNum: number;
  protocol?: string;
  retransmission?: PacketsWithTransport[];
  sticks?: number[];
}

export declare interface PacketHeaders {
  timestampHigh: number;
  timestampLow: number;
  Caplen: number;
  Len: number;
}

export declare interface PacketBody {
  DataLink: DataLinkSchema;
  NetWork: NetWorkSchema;
  Transport: TransportSchema;
  Application: ApplicationSchema | Uint8Array;
}

export declare interface PacketsWithHeaders {
  packetHeaders: PacketHeaders;
  packetBody: Uint8Array;
  FrameNum: number;
}

/**
 * @interface
 * @property {string} packetType linux抓any才有字段，表示包是如何发送的
 * @property {number} LinkLayerAddressType linux抓any才有字段，1 表示ARPHRD_ETHER
 * @property {number} LinkLayerAddressLen linux抓any才有字段，表示来源地址的长度
 * @property {string} DMac 指定网卡抓包才有字段，表示目标Mac地址
 * @property {string} SMac 表示来源Mac地址
 * @property {string} protocol 表示网络层协议？
 * @property {number} DataLinkHeaderLen 链路头长度
 */
export declare interface DataLinkSchema {
  packetType?: string;
  LinkLayerAddressType?: number;
  LinkLayerAddressLen?: number;
  DMac?: string;
  SMac: string;
  protocol: string;
  DataLinkHeaderLen: number;
}

export declare interface PacketsWithDataLink {
  packetHeaders: PacketHeaders;
  packetBody: {
    DataLink: DataLinkSchema;
    NetWork: Uint8Array;
  };
  FrameNum: number;
  protocol?: string;
}

/**
 * @interface NetWorkSchema
 * @property {number} version
 * @property {number} NetWorkHeaderLen 规定报头长度需乘4
 * @property {string} servicesFidle 前3位优先权字段已经舍弃，4位TOS字段和一位保留字段。服务类型
 * @property {number} NetWorkTotalLen 规定报头长度需乘4
 * @property {number} id 若数据总长度大于最大单元则进行分片，对方主机组装数据时的标识
 * @property {boolean} dontFragment 是否禁止分片，一旦禁止分片，超过MTU大小的数据将会直接丢弃
 * @property {boolean} moreFragment 分片的结束标识
 * @property {number} fragmentOffset 分片偏移
 * @property {number} timeToLive 数据段到达对方主机的最大路由次数，一般为64，为了防止循环路由。
 * @property {string} protocol 上层协议的类型
 * @property {string} headerChecksum CRC首部校验和。
 * @property {string} SIP 来源IP
 * @property {string} DIP 目标IP
 */
export declare interface NetWorkSchema {
  version: number;
  NetWorkHeaderLen: number;
  servicesFidle: string;
  NetWorkTotalLen: number;
  id: number;
  dontFragment: boolean;
  moreFragment: boolean;
  fragmentOffset: number;
  timeToLive: number;
  protocol: string;
  headerChecksum: string;
  SIP: string;
  DIP: string;
}

export declare interface PacketsWithNetWork {
  packetHeaders: PacketHeaders;
  packetBody: {
    DataLink: DataLinkSchema;
    NetWork: NetWorkSchema;
    Transport: Uint8Array;
  };
  FrameNum: number;
  protocol?: string;
}

/**
 * @interface TransportSchema
 * @property {number} SPort 来源端口
 * @property {number} DPort 目标端口
 * @property {number} UDPLen UDP属性，UDP包长度
 * @property {number} SeqNum TCP属性，唯一seq
 * @property {number} relativeSeq TCP属性，相对第一个包的seq
 * @property {number} AckNum TCP属性，唯一ack
 * @property {number} relativeAck TCP属性，相对第一个包的ack
 * @property {number} TransportHeaderLen TCP属性，TCP包长度，需乘4
 * @property {TCPFlags} flags TCP属性，
 * @property {number} windowSize TCP属性，该值指示了从Ack Number开始还愿意接收多少byte的数据量，也即用来表示当前接收端的接收窗还有多少剩余空间
 * @property {number} Checksum 接收端要与发送端数值结果完全一样，才能证明数据的有效性。
 * @property {number} UrgentPointer TCP属性，后面是优先数据的字节，在URG标志设置了时才有效。如果URG标志没有被设置，紧急域作为填充。
 * @property {string} option TCP属性，tcp 选项
 */
export declare interface TransportSchema {
  SPort: number;
  DPort: number;
  UDPLen?: number;
  SeqNum?: number;
  relativeSeq?: number;
  AckNum?: number;
  relativeAck?: number;
  TransportHeaderLen?: number;
  flags?: TCPFlags;
  windowSize?: number;
  Checksum: number;
  UrgentPointer?: number;
  option?: string;
}

/**
 * @type {object} TCPFlags
 * @property {boolean} CWR 拥塞窗口减少标志set by sender，用来表明它接收到了设置ECE标志的TCP包。并且sender 在收到消息之后已经通过降低发送窗口的大小来降低发送速率。
 * @property {boolean} ECE ECN响应标志被用来在TCP3次握手时表明一个TCP端是具备ECN功能的。在数据传输过程中也用来表明接收到的TCP包的IP头部的ECN被设置为11。注：IP头部的ECN被设置为11表明网络线路拥堵。
 * @property {boolean} URG 该标志位置位表示紧急(The urgent pointer) 标志有效。该标志位目前已经很少使用参考后面流量控制和窗口管理部分的介绍。
 * @property {boolean} ACK 确认的TCP包
 * @property {boolean} PSH 发送端缓存中已经没有待发送的数据，接收端不将该数据进行队列处理，而是尽可能快将数据转由应用处理。在处理 telnet 或 rlogin 等交互模式的连接时，该标志总是置位的。
 * @property {boolean} RST 用于reset相应的TCP连接。通常在发生异常或者错误的时候会触发复位TCP连接。
 * @property {boolean} SYN 仅在三次握手建立TCP连接时有效。
 * @property {boolean} FIN
 */
type TCPFlags = {
  CWR: boolean;
  ECE: boolean;
  URG: boolean;
  ACK: boolean;
  PSH: boolean;
  RST: boolean;
  SYN: boolean;
  FIN: boolean;
}

export declare interface PacketsWithTransport {
  packetHeaders: PacketHeaders;
  packetBody: {
    DataLink: DataLinkSchema;
    NetWork: NetWorkSchema;
    Transport: TransportSchema;
    Application: Uint8Array;
  };
  FrameNum: number;
  retransmission?: PacketsWithTransport[];
  protocol?: string;
}

/**
 *
 */
export declare type ApplicationSchema = HTTPReqchema | HTTPReschema | WSReschema | ApplicationError;

/**
 * 存在粘包是 body 为 Uint8Array
 */
export declare interface HTTPSchema {
  protocol: 'HTTP';
  headers: StrObj;
  body: object | string | Uint8Array;
  stick?: boolean;
  bodyLen?: number;
}

/**
 * @property {object | string} body 头部为json时返回object
 */
export declare type HTTPReqchema = {
  method: string;
  url: string;
  version: string;
} & HTTPSchema

export declare type HTTPReschema = {
  status: number;
  reason: string;
  version: string;
} & HTTPSchema

export declare interface StrObj {
  [key: string]: string;
}

export declare interface WSReschema {
  FIN: boolean;
  opcode: string;
  payloadLen: number;
  realLen: number;
  useMask: boolean;
  mask: number[];
  body: string | object | Uint8Array;
  protocol: 'websocket';
  stick?: boolean;
  bodyLen?: number;
}

export declare interface ApplicationError {
  body: Uint8Array;
  errMsg: string;
}
