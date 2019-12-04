import {
  Buf2Num,
  buf2num,
  buf2Mac,
  buf2IP,
  buf2Hex,
  buf2UTF8,
  UTF82buf,
  isHTTPMethod,
  concatBuf,
  isPlainObject,
} from '../../src/util';

describe('util functional test', () => {
  it('Buf2Num test', () => {
    const buf = new Uint8Array([0x12, 0x34, 0x56, 0x78]);

    const { buf2num: bifEndian } = new Buf2Num();
    expect(bifEndian(buf)).toEqual(0x12345678);

    const { buf2num: smallEndian } = new Buf2Num(false);
    expect(smallEndian(buf)).toEqual(0x78563412);
  });

  it('buf2num(bifEndian) test', () => {
    const buf = new Uint8Array([0x12, 0x34, 0x56, 0x78]);

    expect(buf2num(buf)).toEqual(0x12345678);
  });

  it('buf2Mac test', () => {
    const macBuf = new Uint8Array([0x00, 0x30, 0x64, 0x46, 0x60, 0x49]);

    expect(buf2Mac(macBuf)).toEqual('00:30:64:46:60:49');
  });

  it('buf2IP test', () => {
    const ipBuf = new Uint8Array([0x0a, 0x23, 0x08, 0x07]);

    expect(buf2IP(ipBuf)).toEqual('10.35.8.7');
  });

  it('buf2Hex test', () => {
    const hexBuf = new Uint8Array([0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0x0f]);

    expect(buf2Hex(hexBuf)).toEqual('00123456789abcde0f');
  });

  it('buf2UTF8 test', () => {
    const UTF8Buf = new Uint8Array([0x2e, 0x6c, 0x61, 0x79, 0x75, 0x6c, 0x74, 0x22, 0xe6, 0xa8, 0xa1, 0xe6, 0x8b, 0x9f, 0xe7, 0xbb, 0x88, 0xe7, 0xab, 0xaf, 0x48, 0x33, 0x32, 0x33, 0x2d, 0x32, 0x39, 0x36, 0x22]);

    expect(buf2UTF8(UTF8Buf)).toEqual('.layult"模拟终端H323-296"');
  });

  it('UTF82buf test', () => {
    const str = '.layult"模拟终端H323-296"';
    const UTF8Buf = new Uint8Array([0x2e, 0x6c, 0x61, 0x79, 0x75, 0x6c, 0x74, 0x22, 0xe6, 0xa8, 0xa1, 0xe6, 0x8b, 0x9f, 0xe7, 0xbb, 0x88, 0xe7, 0xab, 0xaf, 0x48, 0x33, 0x32, 0x33, 0x2d, 0x32, 0x39, 0x36, 0x22]);

    const buf = UTF82buf(str);

    expect(buf[Symbol.toStringTag]).toBe('Uint8Array');
    expect(Array.from(buf)).toMatchObject(Array.from(UTF8Buf));

    // expect(buf).toMatchObject(UTF8Buf); why received object??
  });

  it('isHTTPMethod test', () => {
    const methods = ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'];

    expect(methods.every((method) => isHTTPMethod(method))).toBeTruthy();
  });

  it('concatBuf test', () => {
    const buf1 = new Uint8Array([0x12, 0x34]);
    const buf2 = new Uint8Array([0x56, 0x78]);
    const buf3 = new Uint8Array([0x12, 0x34, 0x56, 0x78]);


    const buf = concatBuf(buf1, buf2);

    expect(buf[Symbol.toStringTag]).toBe('Uint8Array');
    expect(Array.from(buf)).toMatchObject(Array.from(buf3));
  });

  it('isPlainObject test', () => {
    const notObject = ['', 0, false, NaN, <T>(a: T): T => a, [], Symbol(''), null, undefined];


    expect(notObject.every((item) => isPlainObject(item))).not.toBeTruthy();
    expect(isPlainObject({})).toBeTruthy();
  });
});
