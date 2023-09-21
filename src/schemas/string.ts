import { BaseReader, BaseWriter, ReadContext } from '../types.js';
import { DynamicLengthSchema } from './any.js';
import { ComputedSchema } from './computed.js';

class StringComputedSchema<TValue> extends ComputedSchema<string, TValue> {
  computeByteLength(value: TValue): number {
    const encoder = new TextEncoder();
    return encoder.encode(this.serialize(value)).byteLength;
  }

  read(reader: BaseReader, context?: ReadContext): TValue {
    const byteLength = context?.byteLength;
    if (typeof byteLength !== 'number') {
      throw new Error('Invalid byteLength');
    }

    const buffer = reader.readBytes(byteLength);
    const decoder = new TextDecoder();
    return this.parse(decoder.decode(buffer));
  }

  write(writer: BaseWriter, value: TValue): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(this.serialize(value));
    writer.writeBytes(bytes);
  }
}

class StringSchema extends DynamicLengthSchema<string> {
  primitiveType = 'string';

  computeByteLength(value: string): number {
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

  computed<TComputed>(
    parse: (value: string) => TComputed,
    serialize: (value: TComputed) => string,
  ): StringComputedSchema<TComputed> {
    return new StringComputedSchema(parse, serialize);
  }
}

export function string(): StringSchema {
  return new StringSchema();
}

export function json<TJson>(): StringComputedSchema<TJson> {
  return new StringSchema().computed(
    value => JSON.parse(value),
    value => JSON.stringify(value),
  );
}
