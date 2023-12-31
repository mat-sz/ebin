import { fromFloat16 } from '../../helpers/float16.js';
import { BaseReader } from '../../types.js';

export class ArrayBufferReader implements BaseReader {
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

  private incrementOffset(bytes: number) {
    this.bitOffset = 0;
    this.offset += bytes;
  }

  readBits(count: number): number {
    let output = 0;

    for (let i = 0; i < count; i++) {
      if (this.readBit()) {
        output |= 1 << (count - 1 - i);
      }
    }

    return output;
  }

  readBit(): number {
    if (this.bitsLastOffset !== this.offset) {
      this.bitsLastOffset = this.offset;
      this.bitsLastByte = this.dataView.getUint8(this.offset);
    }

    const bit = +!!(this.bitsLastByte & (1 << (7 - this.bitOffset)));

    if (this.bitOffset === 7) {
      this.incrementOffset(1);
    } else {
      this.bitOffset++;
    }

    return bit;
  }

  readInt(byteLength: 8, littleEndian?: boolean): bigint;
  readInt(byteLength: 1 | 2 | 4, littleEndian?: boolean): number;
  readInt(
    byteLength: 1 | 2 | 4 | 8,
    littleEndian = this.littleEndian,
  ): number | bigint {
    try {
      switch (byteLength) {
        case 1:
          return this.dataView.getInt8(this.offset);
        case 2:
          return this.dataView.getInt16(this.offset, littleEndian);
        case 4:
          return this.dataView.getInt32(this.offset, littleEndian);
        case 8:
          // TODO: Fallback for browsers that don't support this.
          return this.dataView.getBigInt64(this.offset, littleEndian);
      }

      throw new Error(`Invalid byteLength = ${byteLength}`);
    } finally {
      this.incrementOffset(byteLength);
    }
  }

  readUint(byteLength: 8, littleEndian?: boolean): bigint;
  readUint(byteLength: 1 | 2 | 4, littleEndian?: boolean): number;
  readUint(
    byteLength: 1 | 2 | 4 | 8,
    littleEndian = this.littleEndian,
  ): number | bigint {
    try {
      switch (byteLength) {
        case 1:
          return this.dataView.getUint8(this.offset);
        case 2:
          return this.dataView.getUint16(this.offset, littleEndian);
        case 4:
          return this.dataView.getUint32(this.offset, littleEndian);
        case 8:
          // TODO: Fallback for browsers that don't support this.
          return this.dataView.getBigUint64(this.offset, littleEndian);
      }

      throw new Error(`Invalid byteLength = ${byteLength}`);
    } finally {
      this.incrementOffset(byteLength);
    }
  }

  readFloat(byteLength: 2 | 4 | 8, littleEndian = this.littleEndian): number {
    try {
      switch (byteLength) {
        case 2:
          return fromFloat16(
            this.dataView.getUint16(this.offset, littleEndian),
          );
        case 4:
          return this.dataView.getFloat32(this.offset, littleEndian);
        case 8:
          return this.dataView.getFloat64(this.offset, littleEndian);
      }

      throw new Error(`Invalid byteLength = ${byteLength}`);
    } finally {
      this.incrementOffset(byteLength);
    }
  }

  readBytes(byteLength: number): ArrayBuffer {
    try {
      return this.arrayBuffer.slice(this.offset, this.offset + byteLength);
    } finally {
      this.incrementOffset(byteLength);
    }
  }
}
