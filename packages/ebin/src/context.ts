import { TypedArray } from './types.js';

export class EbinContext {
  littleEndian = false;
  offset = 0;

  constructor(public view: DataView) {}

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
