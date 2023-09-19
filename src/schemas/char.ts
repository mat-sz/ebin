import { BaseReader, BaseWriter } from '../types.js';
import { AnySchema } from './any.js';

class CharSchema extends AnySchema<string> {
  primitiveType = 'number';
  byteLength = 1;

  constructor() {
    super();
  }

  read(reader: BaseReader): string {
    const byte = reader.readUint(1);
    return String.fromCharCode(byte);
  }

  write(writer: BaseWriter, value: string): void {
    const byte = value.charCodeAt(0);
    if (byte > 255 || byte < 0) {
      throw new Error(
        `Value '${value}' cannot be represented as a single byte.`,
      );
    }

    writer.writeUint(1, byte);
  }
}

export function char(): CharSchema {
  return new CharSchema();
}
