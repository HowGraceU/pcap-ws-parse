import fs from 'fs';
import parser from '../src/index';

describe('checked result schema', () => {
  const fileName = './pcap/ws.pcap';
  const fileBuf = fs.readFileSync(fileName);
  const pcapResult = parser(fileBuf);

  it('result schema', () => {
    expect(pcapResult);
    expect(Reflect.has(pcapResult, 'pcapHeaders')).toBe(true);
    expect(Reflect.has(pcapResult, 'pcapBody')).toBe(true);
  });

  const { pcapHeaders, pcapBody } = pcapResult;

  it('pcapHeaders schema', () => {
    expect(typeof pcapHeaders).toBe('object');
    const {
      LinkType,
      Magic,
      Major,
      Minor,
      order,
      SigFigs,
      SnapLen,
      ThisZone,
    } = pcapHeaders;
    expect(typeof LinkType).toBe('string');
    expect(Magic[Symbol.toStringTag]).toBe('Uint8Array');
    expect(typeof Major).toBe('number');
    expect(typeof Minor).toBe('number');
    expect(typeof order).toBe('boolean');
    expect(typeof SigFigs).toBe('number');
    expect(typeof SnapLen).toBe('number');
    expect(typeof ThisZone).toBe('number');
  });

  it('pcap schema', () => {
    expect(Array.isArray(pcapBody)).toBe(true);
    const [packet] = pcapBody;
    expect(Reflect.has(packet, 'FrameNum')).toBe(true);
    expect(Reflect.has(packet, 'packetHeaders')).toBe(true);
    expect(Reflect.has(packet, 'packetBody')).toBe(true);
    expect(Reflect.has(packet, 'protocol')).toBe(true);
  });

  if (Array.isArray(pcapBody)) {
    pcapBody.forEach((packet) => {
      const {
        FrameNum,
        packetHeaders,
        packetBody,
        protocol,
      } = packet;
      // console.log(`check FrameNum : ${FrameNum}`);
      it('packet schema', () => {
        expect(typeof FrameNum).toBe('number');
        expect(typeof packetHeaders).toBe('object');
        expect(typeof packetBody).toBe('object');
        expect(typeof protocol).toBe('string');
      });

      it('packetHeaders schema', () => {
        const {
          Caplen,
          Len,
          timestampHigh,
          timestampLow,
        } = packetHeaders;

        expect(typeof Caplen).toBe('number');
        expect(typeof Len).toBe('number');
        expect(typeof timestampHigh).toBe('number');
        expect(typeof timestampLow).toBe('number');
      });

      const {
        Application,
        DataLink,
        NetWork,
        Transport,
      } = packetBody;
      it('packetBody schema', () => {
        expect(typeof DataLink).toBe('object');
        expect(typeof NetWork).toBe('object');
        expect(typeof Transport).toBe('object');
      });

      const {
        DataLinkHeaderLen,
        LinkLayerAddressLen,
        LinkLayerAddressType,
        packetType,
        protocol: DLProtocol,
        SMac,
        DMac,
      } = DataLink;
      it('DataLink schema', () => {
        if (typeof DMac === 'undefined') {
          expect(typeof DataLinkHeaderLen).toBe('number');
          expect(typeof LinkLayerAddressLen).toBe('number');
          expect(typeof LinkLayerAddressType).toBe('number');
          expect(typeof packetType).toBe('string');
          expect(typeof DLProtocol).toBe('string');
          expect(typeof SMac).toBe('string');
        } else {
          expect(typeof DataLinkHeaderLen).toBe('number');
          expect(typeof DLProtocol).toBe('string');
          expect(typeof SMac).toBe('string');
          expect(typeof DMac).toBe('string');
        }
      });

      const {
        version,
        NetWorkHeaderLen,
        servicesFidle,
        NetWorkTotalLen,
        id,
        dontFragment,
        moreFragment,
        fragmentOffset,
        timeToLive,
        protocol: NWProtocol,
        headerChecksum,
        SIP,
        DIP,
      } = NetWork;
      it('NetWork schema', () => {
        expect(typeof version).toBe('number');
        expect(typeof NetWorkHeaderLen).toBe('number');
        expect(typeof servicesFidle).toBe('string');
        expect(typeof NetWorkTotalLen).toBe('number');
        expect(typeof id).toBe('number');
        expect(typeof dontFragment).toBe('boolean');
        expect(typeof moreFragment).toBe('boolean');
        expect(typeof fragmentOffset).toBe('number');
        expect(typeof timeToLive).toBe('number');
        expect(typeof NWProtocol).toBe('string');
        expect(typeof headerChecksum).toBe('string');
        expect(typeof SIP).toBe('string');
        expect(typeof DIP).toBe('string');
      });

      const {
        SPort,
        DPort,
        UDPLen,
        SeqNum,
        relativeSeq,
        AckNum,
        relativeAck,
        TransportHeaderLen,
        flags,
        windowSize,
        Checksum,
        UrgentPointer,
        option,
      } = Transport;
      it('Transport schema', () => {
        expect(typeof SPort).toBe('number');
        expect(typeof DPort).toBe('number');
        expect(typeof Checksum).toBe('number');

        if (NWProtocol === 'TCP') {
          expect(typeof SeqNum).toBe('number');
          expect(typeof relativeSeq).toBe('number');
          expect(typeof AckNum).toBe('number');
          expect(typeof relativeAck).toBe('number');
          expect(typeof TransportHeaderLen).toBe('number');
          expect(typeof flags).toBe('object');
          expect(typeof windowSize).toBe('number');
          expect(typeof UrgentPointer).toBe('number');
          expect(typeof option).toBe('string');
        }

        if (NWProtocol === 'UDP') {
          expect(typeof UDPLen).toBe('number');
        }
      });

      it('Application schema', () => {
        if ('protocol' in Application) {
          if (Application.protocol === 'HTTP') {
            if ('method' in Application) {
              const {
                method,
                url,
                version: AppVersion,
                headers,
                body,
              } = Application;
              expect(typeof method).toBe('string');
              expect(typeof url).toBe('string');
              expect(typeof AppVersion).toBe('string');
              expect(typeof headers).toBe('object');

              const contentType = headers['Content-Type'];
              expect(typeof body).toBe(contentType.includes('application/json') ? 'object' : 'string');
            } else {
              const {
                status,
                reason,
                version: AppVersion,
                headers,
                body,
              } = Application;

              expect(typeof status).toBe('number');
              expect(typeof reason).toBe('string');
              expect(typeof AppVersion).toBe('string');
              expect(typeof headers).toBe('object');

              const contentType = headers['Content-Type'];
              expect(typeof body).toBe(contentType.includes('application/json') ? 'object' : 'string');
            }
          } else if (Application.protocol === 'websocket') {
            const {
              FIN,
              opcode,
              payloadLen,
              realLen,
              useMask,
              mask,
            } = Application;

            expect(typeof FIN).toBe('boolean');
            expect(typeof opcode).toBe('string');
            expect(typeof payloadLen).toBe('number');
            expect(typeof realLen).toBe('number');
            expect(typeof useMask).toBe('boolean');
            expect(Array.isArray(mask)).toBe(true);
          }
        } else if ('body' in Application) {
          const {
            body,
            errMsg,
          } = Application;

          expect(body[Symbol.toStringTag]).toBe('Uint8Array');
          expect(typeof errMsg).toBe('string');
        } else {
          expect(Application[Symbol.toStringTag]).toBe('Uint8Array');
        }
      });
    });
  }
});
