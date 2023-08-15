import { BaseReader } from '../../types.js';

export class ArrayBufferReader implements BaseReader {
  offset = 0;
  dataView: DataView;
  littleEndian = false;

  constructor(private arrayBuffer: ArrayBuffer) {
    this.dataView = new DataView(arrayBuffer);
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
      this.offset += byteLength;
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
      this.offset += byteLength;
    }
  }

  readFloat(byteLength: 4 | 8, littleEndian = this.littleEndian): number {
    try {
      switch (byteLength) {
        case 4:
          return this.dataView.getFloat32(this.offset, littleEndian);
        case 8:
          return this.dataView.getFloat64(this.offset, littleEndian);
      }

      throw new Error(`Invalid byteLength = ${byteLength}`);
    } finally {
      this.offset += byteLength;
    }
  }

  readString(byteLength: number): string {
    const buffer = this.readBytes(byteLength);
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }

  readBytes(byteLength: number): ArrayBuffer {
    try {
      return this.arrayBuffer.slice(this.offset, this.offset + byteLength);
    } finally {
      this.offset += byteLength;
    }
  }
}
