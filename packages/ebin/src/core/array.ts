import { EbinContext } from '../context.js';
import { BaseSchema, LookupField, SchemaValue } from '../types.js';
import {
  createNumberLookupField,
  NumberLookupFieldParamType,
} from '../utils/lookupField.js';
import { SchemaWithEndianness } from './any.js';

export class ArraySchema<
  TItemSchema extends BaseSchema<any>,
  TValue = SchemaValue<TItemSchema>,
> extends SchemaWithEndianness<TValue[]> {
  lookups: {
    size?: LookupField<number>;
    count?: LookupField<number>;
  } = {};

  private _prefixSize: number = 0;

  get isConstantSize() {
    return !!(
      this.lookups.size?.isConstant ||
      (this.lookups.count?.isConstant && this.itemType.isConstantSize)
    );
  }

  constructor(public itemType: TItemSchema) {
    super();
  }

  private getArraySize(value: TValue[]) {
    if (this.itemType.isConstantSize) {
      return value.length * this.itemType.getSize(value[0]);
    }

    return value.reduce(
      (byteLength, item) => byteLength + this.itemType.getSize(item),
      0,
    );
  }

  getSize(value: TValue[]) {
    return this._prefixSize + this.getArraySize(value);
  }

  private readArray(ctx: EbinContext, parent?: any) {
    const countLookup = this.lookups.count;
    if (countLookup) {
      const count = countLookup.read(ctx, parent);
      const items: TValue[] = new Array(count);
      for (let i = 0; i < count; i++) {
        items[i] = this.itemType.read(ctx);
      }

      return items;
    } else {
      const size =
        this.lookups.size?.read(ctx, parent) ??
        ctx.view.byteLength - ctx.offset;

      const offset = ctx.offset;
      const items: TValue[] = [];

      while (ctx.offset - offset < size) {
        items.push(this.itemType.read(ctx));
      }

      return items;
    }
  }

  read(ctx: EbinContext, parent?: any): TValue[] {
    const littleEndian = ctx.littleEndian;
    if (typeof this._littleEndian !== 'undefined') {
      ctx.littleEndian = this._littleEndian;
    }

    const output = this.readArray(ctx, parent);
    ctx.littleEndian = littleEndian;
    return output;
  }

  write(ctx: EbinContext, value: TValue[]): void {
    const littleEndian = ctx.littleEndian;
    if (typeof this._littleEndian !== 'undefined') {
      ctx.littleEndian = this._littleEndian;
    }

    this.lookups.size?.write?.(ctx, this.getArraySize(value));
    this.lookups.count?.write?.(ctx, value.length);

    for (let i = 0; i < value.length; i++) {
      this.itemType.write(ctx, value[i]);
    }

    ctx.littleEndian = littleEndian;
  }

  count(field: NumberLookupFieldParamType): this {
    this.lookups = {
      count: createNumberLookupField(field),
    };
    this.updatePrefixSize();
    return this;
  }

  size(field: NumberLookupFieldParamType): this {
    this.lookups = {
      size: createNumberLookupField(field),
    };
    this.updatePrefixSize();
    return this;
  }

  greedy(): this {
    this.lookups = {};
    this.updatePrefixSize();
    return this;
  }

  private updatePrefixSize() {
    this._prefixSize =
      (this.lookups.size?.size ?? 0) + (this.lookups.count?.size ?? 0);
  }

  preWrite(value: TValue[], parent: any) {
    this.lookups.size?.preWrite?.(this.getArraySize(value), parent);
    this.lookups.count?.preWrite?.(value.length, parent);
  }
}

export function array<TItemSchema extends BaseSchema<any>>(
  itemType: TItemSchema,
): ArraySchema<TItemSchema> {
  return new ArraySchema(itemType);
}
