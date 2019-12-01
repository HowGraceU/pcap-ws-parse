class Buf2Num {
  public buf2num: (buf: Uint8Array) => number

  /**
   * @param order true 为正序, false 为倒序
   */
  constructor(order = true) {
    this.buf2num = (buf): number => {
      const sortBuf = order ? Uint8Array.from(buf).reverse() : buf;

      return sortBuf.reduce((sum, byte, index) => sum + byte * 2 ** (8 * index), 0);
    };
  }
}

const buf2numInstanc = new Buf2Num();
const { buf2num } = buf2numInstanc;

export { Buf2Num, buf2num };
