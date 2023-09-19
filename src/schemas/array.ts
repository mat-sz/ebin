import {
  BaseReader,
  BaseSchema,
  BaseWriter,
  Infer,
  ReadContext,
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

  computeByteLength(value: TValue[]): number {
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
}

export function array<TItemSchema extends BaseSchema<any>>(
  itemType: TItemSchema,
): ArraySchema<TItemSchema> {
  return new ArraySchema(itemType);
}
