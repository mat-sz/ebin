import { BaseReader, BaseWriter } from '../types.js';
import { AnySchema } from './any.js';

class BitSchema extends AnySchema<number> {
  protected _littleEndian: boolean | undefined = undefined;
  primitiveType = 'number';

  getByteLength() {
    return 1 / 8;
  }

  constructor() {
    super();
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
