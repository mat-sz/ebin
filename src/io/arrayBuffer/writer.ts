import { BaseWriter } from '../../types.js';

export class ArrayBufferWriter implements BaseWriter {
  offset = 0;
  bitOffset = 0;
  dataView: DataView;
  littleEndian = false;

  private bitsLastByte = 0;
  private bitsLastOffset = -1;

  constructor(private arrayBuffer: ArrayBuffer) {
    this.dataView = new DataView(arrayBuffer);
  }

  get currentOffset() {
    return this.offset + this.bitOffset / 8;
  }

  writeBits(count: number, value: number): void {
    for (let i = 0; i < count; i++) {
      this.writeBit(+!!(value & (1 << (count - 1 - i))));
    }
  }

  writeBit(value: number): void {
    if (this.bitsLastOffset !== this.offset) {
      this.bitsLastOffset = this.offset;
      this.bitsLastByte = 0;
    }

    if (value) {
      this.bitsLastByte |= 1 << (7 - this.bitOffset);
    }

    if (this.bitOffset === 7) {
      this.dataView.setUint8(this.offset, this.bitsLastByte);
      this.bitOffset = 0;
      this.offset++;
    } else {
      this.bitOffset++;
    }
  }

  writeInt(byteLength: 8, value: bigint, littleEndian?: boolean): void;
  writeInt(byteLength: 1 | 2 | 4, value: number, littleEndian?: boolean): void;
  writeInt(
    byteLength: 1 | 2 | 4 | 8,
    value: number | bigint,
    littleEndian = this.littleEndian,
  ): void {
    try {
      switch (byteLength) {
        case 1:
          this.dataView.setInt8(this.offset, value as number);
          break;
        case 2:
          this.dataView.setInt16(this.offset, value as number, littleEndian);
          break;
        case 4:
          this.dataView.setInt32(this.offset, value as number, littleEndian);
          break;
        case 8:
          // TODO: Fallback for browsers that don't support this.
          this.dataView.setBigInt64(this.offset, value as bigint, littleEndian);
          break;
        default:
          throw new Error(`Invalid byteLength = ${byteLength}`);
      }
    } finally {
      this.offset += byteLength;
    }
  }

  writeUint(byteLength: 8, value: bigint, littleEndian?: boolean): void;
  writeUint(byteLength: 1 | 2 | 4, value: number, littleEndian?: boolean): void;
  writeUint(
    byteLength: 1 | 2 | 4 | 8,
    value: number | bigint,
    littleEndian = this.littleEndian,
  ): void {
    try {
      switch (byteLength) {
        case 1:
          this.dataView.setUint8(this.offset, value as number);
          break;
        case 2:
          this.dataView.setUint16(this.offset, value as number, littleEndian);
          break;
        case 4:
          this.dataView.setUint32(this.offset, value as number, littleEndian);
          break;
        case 8:
          // TODO: Fallback for browsers that don't support this.
          this.dataView.setBigUint64(
            this.offset,
            value as bigint,
            littleEndian,
          );
          break;
        default:
          throw new Error(`Invalid byteLength = ${byteLength}`);
      }
    } finally {
      this.offset += byteLength;
    }
  }

  writeFloat(
    byteLength: 4 | 8,
    value: number,
    littleEndian = this.littleEndian,
  ): void {
    try {
      switch (byteLength) {
        case 4:
          this.dataView.setFloat32(this.offset, value as number, littleEndian);
          break;
        case 8:
          this.dataView.setFloat64(this.offset, value as number, littleEndian);
          break;
        default:
          throw new Error(`Invalid byteLength = ${byteLength}`);
      }
    } finally {
      this.offset += byteLength;
    }
  }

  writeString(value: string): void {
    const encoder = new TextEncoder();
    this.writeBytes(encoder.encode(value));
  }

  writeBytes(bytes: ArrayBuffer): void {
    const array = new Uint8Array(this.arrayBuffer);
    array.set(new Uint8Array(bytes), this.offset);
    this.offset += bytes.byteLength;
  }
}
