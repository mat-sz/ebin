import { EbinContext } from '../context.js';
import { BaseSchema, SchemaValue } from '../types.js';
import { SchemaWithEndianness } from './any.js';

export class ArraySchema<
  TItemSchema extends BaseSchema<any>,
  TValue = SchemaValue<TItemSchema>,
> extends SchemaWithEndianness<TValue[]> {
  countField?: string;
  sizeField?: string;

  isConstantSize = false;

  get dependsOnParent() {
    return !!(this.countField || this.sizeField);
  }

  constructor(public itemType: TItemSchema) {
    super();
  }

  getSize(value: TValue[]) {
    if (this.itemType.isConstantSize) {
      return value.length * this.itemType.getSize(value[0]);
    }

    return value.reduce(
      (byteLength, item) => byteLength + this.itemType.getSize(item),
      0,
    );
  }

  read(ctx: EbinContext, parent?: any): TValue[] {
    const byteLength = parent[this.sizeField as any];
    const count = parent[this.countField as any];

    if (typeof byteLength === 'undefined' && typeof count === 'undefined') {
      throw new Error('Either count or byteLength must be provided.');
    }

    if (byteLength) {
      const items: TValue[] = [];
      const startOffset = ctx.offset;

      while (ctx.offset - startOffset < byteLength) {
        items.push(this.itemType.read(ctx));
      }
      return items;
    } else if (count) {
      const items: TValue[] = new Array(count);
      for (let i = 0; i < count; i++) {
        items[i] = this.itemType.read(ctx);
      }
      return items;
    }

    return [];
  }

  write(ctx: EbinContext, value: TValue[]): void {
    for (let i = 0; i < value.length; i++) {
      this.itemType.write(ctx, value[i]);
    }
  }

  count(field: string): this {
    this.countField = field;
    return this;
  }

  size(field: string): this {
    this.sizeField = field;
    return this;
  }

  preWrite(value: TValue[], parent: any) {
    if (this.sizeField) {
      parent[this.sizeField] = this.getSize(value);
    }

    if (this.countField) {
      parent[this.countField] = value.length;
    }
  }
}

export function array<TItemSchema extends BaseSchema<any>>(
  itemType: TItemSchema,
): ArraySchema<TItemSchema> {
  return new ArraySchema(itemType);
}
