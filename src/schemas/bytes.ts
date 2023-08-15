import { BaseReader, BaseWriter, TypedArray } from '../types.js';
import { DynamicLengthSchema } from './any.js';
import { ComputedSchema } from './computed.js';

class BytesSchema<
  T extends ArrayBuffer | TypedArray,
> extends DynamicLengthSchema<T> {
  computeByteLength(value: T): number {
    return value.byteLength;
  }
}

class ArrayBufferComputedSchema<TValue> extends ComputedSchema<
  ArrayBuffer,
  TValue
> {
  read(reader: BaseReader): TValue {
    return this.parse(reader.readBytes(this.byteLength));
  }

  write(writer: BaseWriter, value: TValue): void {
    writer.writeBytes(this.serialize(value));
  }
}

class ArrayBufferSchema extends BytesSchema<ArrayBuffer> {
  read(reader: BaseReader): ArrayBuffer {
    return reader.readBytes(this.byteLength);
  }

  write(writer: BaseWriter, value: ArrayBuffer): void {
    writer.writeBytes(value);
  }

  computed<TComputed>(
    parse: (value: ArrayBuffer) => TComputed,
    serialize: (value: TComputed) => ArrayBuffer,
  ): ArrayBufferComputedSchema<TComputed> {
    return new ArrayBufferComputedSchema(parse, serialize);
  }
}

export function arrayBuffer(): ArrayBufferSchema {
  return new ArrayBufferSchema();
}

class Uint8ArraySchema extends BytesSchema<Uint8Array> {
  read(reader: BaseReader): Uint8Array {
    const buffer = reader.readBytes(this.byteLength);
    return new Uint8Array(buffer);
  }

  write(writer: BaseWriter, value: Uint8Array): void {
    writer.writeBytes(value.buffer);
  }
}

export function uint8Array(): Uint8ArraySchema {
  return new Uint8ArraySchema();
}
