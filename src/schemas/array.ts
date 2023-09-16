import { BaseReader, BaseSchema, BaseWriter, Infer } from '../types.js';
import { DynamicLengthSchema } from './any.js';

export class ArraySchema<
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

  read(reader: BaseReader, length?: number): TValue[] {
    if (typeof length === 'undefined') {
      throw new Error('Invalid length');
    }

    const items: TValue[] = [];
    const startOffset = reader.currentOffset;

    while (reader.currentOffset - startOffset < length) {
      items.push(this.itemType.read(reader, length));
    }

    return items;
  }

  write(writer: BaseWriter, value: TValue[], length?: number): void {
    const startOffset = writer.currentOffset;
    for (const item of value) {
      const itemLength =
        typeof length === 'number'
          ? writer.currentOffset + length - startOffset
          : undefined;

      if (typeof itemLength === 'number' && itemLength <= 0) {
        throw new Error(`Supplied byteLength is less than array byteLength`);
      }

      this.itemType.write(writer, item, itemLength);
    }
  }
}

export function array<TItemSchema extends BaseSchema<any>>(
  itemType: TItemSchema,
): ArraySchema<TItemSchema> {
  return new ArraySchema(itemType);
}
