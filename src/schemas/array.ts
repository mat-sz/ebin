import { ArrayBufferReader } from '../io/arrayBuffer/reader.js';
import { ArrayBufferWriter } from '../io/arrayBuffer/writer.js';
import {
  BaseReader,
  BaseSchema,
  BaseWriter,
  Infer,
  ReadContext,
  TypedArray,
} from '../types.js';
import { DynamicLengthSchema } from './any.js';

class ArraySchema<
  TItemSchema extends BaseSchema<any>,
  TValue = Infer<TItemSchema>,
> extends DynamicLengthSchema<TValue[]> {
  primitiveType = 'string';

  constructor(public itemType: TItemSchema) {
    super();
  }

  getByteLength(value: TValue[]): number {
    if (this.itemType.isConstantSize) {
      return value.length * this.itemType.getByteLength(value[0]);
    }

    return value.reduce(
      (byteLength, item) => byteLength + this.itemType.getByteLength(item),
      0,
    );
  }

  getCount(value?: TValue[]): number {
    return value?.length || 0;
  }

  read(reader: BaseReader, context?: ReadContext): TValue[] {
    const byteLength = context?.byteLength;
    const count = context?.count;

    if (typeof byteLength === 'undefined' && typeof count === 'undefined') {
      throw new Error('Either count or byteLength must be passed');
    }

    const items: TValue[] = [];

    if (byteLength) {
      const startOffset = reader.currentOffset;

      while (reader.currentOffset - startOffset < byteLength) {
        items.push(this.itemType.read(reader, context));
      }
    } else if (count) {
      for (let i = 0; i < count; i++) {
        items.push(this.itemType.read(reader));
      }
    }

    return items;
  }

  write(writer: BaseWriter, value: TValue[]): void {
    for (const item of value) {
      this.itemType.write(writer, item);
    }
  }

  fromByteArray(array: TypedArray): TValue[] {
    const reader = new ArrayBufferReader(
      array.buffer.slice(array.byteOffset, array.byteOffset + array.byteLength),
    );
    return this.read(reader, { byteLength: array.byteLength });
  }

  toByteArray(value: TValue[]): Uint8Array {
    const length = this.getByteLength(value);
    const array = new Uint8Array(length);
    const writer = new ArrayBufferWriter(array.buffer);

    this.write(writer, value);
    return array;
  }

  fromArrayBuffer(buffer: ArrayBuffer): TValue[] {
    return this.fromByteArray(new Uint8Array(buffer));
  }

  toArrayBuffer(value: TValue[]): ArrayBuffer {
    return this.toByteArray(value).buffer;
  }
}

export function array<TItemSchema extends BaseSchema<any>>(
  itemType: TItemSchema,
): ArraySchema<TItemSchema> {
  return new ArraySchema(itemType);
}
