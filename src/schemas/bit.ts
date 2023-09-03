import { BaseReader, BaseWriter } from '../types.js';
import { AnySchema } from './any.js';

export class BitSchema extends AnySchema<number> {
  protected _littleEndian: boolean | undefined = undefined;
  primitiveType = 'number';

  getByteLength() {
    return 1 / 8;
  }

  constructor() {
    super();
  }

  littleEndian() {
    this._littleEndian = true;
  }

  bigEndian() {
    this._littleEndian = false;
  }

  read(reader: BaseReader): number {
    return reader.readBit();
  }

  write(writer: BaseWriter, value: number): void {
    writer.writeBit(value);
  }
}

export function bit(): BitSchema {
  return new BitSchema();
}
