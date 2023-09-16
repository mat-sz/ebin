import { BaseReader, BaseWriter } from '../types.js';
import { AnySchema } from './any.js';

export class BitsSchema extends AnySchema<number> {
  protected _littleEndian: boolean | undefined = undefined;
  primitiveType = 'number';

  getByteLength() {
    return this.bitLength / 8;
  }

  constructor(public bitLength: number) {
    super();
  }

  littleEndian() {
    this._littleEndian = true;
  }

  bigEndian() {
    this._littleEndian = false;
  }

  read(reader: BaseReader): number {
    return reader.readBits(this.bitLength);
  }

  write(writer: BaseWriter, value: number): void {
    writer.writeBits(this.bitLength, value);
  }
}

export function bits(count: number): BitsSchema {
  return new BitsSchema(count);
}