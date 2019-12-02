# pcap-ws-parse

# 前提

对 websocket 链接进行抓包，需要从 websocket 握手开始抓， wireshake 才能解析出正确的协议。
而在 websocket 中途抓包，wireshake 只会显示 tcp 协议，并且无法知道传输的内容。

这个 module 主要解析没有抓到 websocket 握手包的 pcap 抓包文件，能将其中的 HTTP 协议和 websocket 协议内容解析出来。
解析时，只会解基于 TCP 传输的应用层的包，暂时只会以 HTTP 和 websocket 的格式去尝试协议应用层数据。

# 使用说明

可以根据 websocket 协议帧来解析其中的内容。
打开 index.html，将抓到的 tcp 包拷贝为 hex stream，粘贴进网页左边大框。