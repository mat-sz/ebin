import { BaseReader, BaseWriter, ReadContext } from '../types.js';
import { ComputedSchema, DynamicLengthSchema } from './any.js';

class StringSchema extends DynamicLengthSchema<string> {
  primitiveType = 'string';

  getByteLength(value: string): number {
    const encoder = new TextEncoder();
    return encoder.encode(value).byteLength;
  }

  read(reader: BaseReader, context?: ReadContext): string {
    const byteLength = context?.byteLength;
    if (typeof byteLength !== 'number') {
      throw new Error('Invalid byteLength');
    }

    const buffer = reader.readBytes(byteLength);
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }

  write(writer: BaseWriter, value: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    writer.writeBytes(bytes);
  }
}

export function string(): StringSchema {
  return new StringSchema();
}

export function json<TJson>(): ComputedSchema<string, TJson> {
  return new StringSchema().computed(
    value => JSON.parse(value),
    value => JSON.stringify(value),
  );
}
