import { TypedArray } from './types.js';

export class EbinContext {
  littleEndian = false;
  offset = 0;
  array: Uint8Array;

  constructor(public view: DataView) {
    this.array = new Uint8Array(view.buffer);
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
