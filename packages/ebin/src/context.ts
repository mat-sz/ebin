import { TypedArray } from './types.js';

export class EbinContext {
  littleEndian = false;
  offset = 0;
  array: Uint8Array;

  constructor(public view: DataView) {
    this.array = new Uint8Array(view.buffer);
  }

  forward(size: number) {
    const offset = this.offset;
    this.offset += size;
    return offset;
  }

  static fromArrayBuffer(buffer: ArrayBufferLike) {
    return new EbinContext(new DataView(buffer));
  }

  static fromTypedArray(array: TypedArray) {
    return new EbinContext(
      new DataView(
        array.buffer,
        array.byteOffset,
        array.byteOffset + array.byteLength,
      ),
    );
  }
}
