import { BaseReader, BaseWriter } from '../types.js';
import { DynamicLengthSchema } from './any.js';
import { ComputedSchema } from './computed.js';

class StringComputedSchema<TValue> extends ComputedSchema<string, TValue> {
  read(reader: BaseReader): TValue {
    const buffer = reader.readBytes(length);
    const decoder = new TextDecoder();
    return this.parse(decoder.decode(buffer));
  }

  write(writer: BaseWriter, value: TValue): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(this.serialize(value));
    writer.writeBytes(bytes);
  }
}

export class StringSchema extends DynamicLengthSchema<string> {
  primitiveType = 'string';

  computeByteLength(value: string): number {
    const encoder = new TextEncoder();
    return encoder.encode(value).byteLength;
  }

  read(reader: BaseReader, length?: number): string {
    if (typeof length === 'undefined') {
      throw new Error('Invalid length');
    }

    const buffer = reader.readBytes(length);
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }

  write(writer: BaseWriter, value: string, length?: number): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);

    if (typeof length === 'number' && length < bytes.byteLength) {
      throw new Error(
        `Supplied byteLength is less than string length: ${length} < ${bytes.byteLength}`,
      );
    }

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
