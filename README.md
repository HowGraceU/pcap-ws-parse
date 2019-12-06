# pcap-ws-parse

# 前提

对 websocket 链接进行抓包，需要从 websocket 握手开始抓， wireshake 才能解析出正确的协议。
而在 websocket 中途抓包，wireshake 只会显示 tcp 协议，并且无法知道传输的内容。

这个 module 主要解析没有抓到 websocket 握手包的 pcap 抓包文件，能将其中的 HTTP 协议和 websocket 协议内容解析出来。
解析时，只会解基于 TCP 传输的应用层的包，暂时只会以 HTTP 和 websocket 的格式去尝试协议应用层数据。

# 安装

```
$ npm install pcap-ws-parse -S

or

$ yarn add pcap-ws-parse
```

# 使用说明

``` js
// node.js
const fs = require('fs');

const parser = require('pcap-ws-parse');

const fileName = './pcap/ws.pcap';
const fileBuf = fs.readFileSync(fileName);

const ret = parser(fileBuf);
console.log(ret);
```

``` html
<!-- browser -->
<input type="file" id="file">

<script>
	import parser from 'pcap-ws-parse';

	const file = document.getElementById('file');
	file.onchange = e => {
		const pcap = file.files[0];
		const reader = new FileReader();

		reader.readAsArrayBuffer(pcap);

		reader.onload = function () {
			const pcapBuf = reader.result;
			const pcapArr = new Uint8Array(pcapBuf);

			const ret = parser(pcapArr);
			console.log(ret);
		}
	}
</script>
```

# 数据结构

``` typescript
function parser(fileBuffer: Uint8Array): PcapResult;

declare interface PcapResult {
	pcapHeaders: {
		Magic: Uint8Array; // 0×1A 2B 3C 4D:用来识别文件自己和字节顺序。0xa1b2c3d4用来表示按照原来的顺序读取，0xd4c3b2a1表示下面的字节都要交换顺序读取
    order: boolean; // 是否倒序
    Major: number; // 当前文件主要的版本号
    Minor: number; // 当前文件次要的版本号
    ThisZone: number; // 时区。GMT和本地时间的相差，用秒来表示。如果本地的时区是GMT，那么这个值就设置为0.这个值一般也设置为0 SigFigs：4B时间戳的精度；全零
    SigFigs: number; // 时间戳的精度；全零,毫秒
    SnapLen: number; // 最大的存储长度（该值设置所抓获的数据包的最大长度。如果所有数据包都要抓获，将该值设置为65535； 例如：想获取数据包的前64字节，可将该值设置为64）
    LinkType: string; // 链路类型
	};
	pcapBody: [{
		packetHeaders: {
			timestampHigh: number; // 时间戳高位
			timestampLow: number; // 时间戳低位
			Caplen: number; // pcap包长度
			Len: number; // 数据长度
		};
    packetBody: {
			DataLink: object; // 物理链路层
			NetWork: object; // 网络层
			Transport: object; // 传输层
			Application: object; // 应用层
		};
		FrameNum: number; // 包的排位，表示第几个包
		protocol?: string; // 协议，可能不存在这个字段，有 TCP,UDP,HTTP,websocket
    retransmission?: array; // 是否存在重传，重传包的内容
    sticks?: number[]; // 是否存在粘包，粘包的 FrameNum
	}, ...];
}
```