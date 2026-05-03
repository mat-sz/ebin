import type { TypedArray } from './types.js';

export class EbinContext {
  offset = 0;
  array: Uint8Array;

  constructor(public view: DataView) {
    this.array = new Uint8Array(view.buffer);
  }

  slice(offset: number, size: number) {
    return new Uint8Array(this.view.buffer, offset, size);
  }

  bytes(size: number) {
    const offset = this.offset;
    this.offset += size;
    return this.slice(offset, size);
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
    return new EbinContext(new DataView(array.buffer, array.byteOffset, array.byteOffset + array.byteLength));
  }
}
