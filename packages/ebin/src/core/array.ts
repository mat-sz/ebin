import { EbinContext } from '../context.js';
import { BaseSchema, SchemaValue } from '../types.js';
import {
  createNumberLookupField,
  LookupField,
  NumberLookupFieldParamType,
} from '../utils/lookupField.js';
import { SchemaWithEndianness } from './any.js';

export class ArraySchema<
  TItemSchema extends BaseSchema<any>,
  TValue = SchemaValue<TItemSchema>,
> extends SchemaWithEndianness<TValue[]> {
  private _countLookup?: LookupField<number>;
  private _sizeLookup?: LookupField<number>;

  private _prefixSize: number = 0;

  get isConstantSize() {
    return !!(
      this._sizeLookup?.isConstant ||
      (this._countLookup?.isConstant && this.itemType.isConstantSize)
    );
  }

  get dependsOnParent() {
    return !!(
      this._countLookup?.dependsOnParent || this._sizeLookup?.dependsOnParent
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

  read(ctx: EbinContext, parent?: any): TValue[] {
    const littleEndian = ctx.littleEndian;
    if (typeof this._littleEndian !== 'undefined') {
      ctx.littleEndian = this._littleEndian;
    }

    const size = this._sizeLookup?.read(ctx, parent);
    const count = this._countLookup?.read(ctx, parent);

    if (typeof size === 'number') {
      const items: TValue[] = [];
      const startOffset = ctx.offset;

      while (ctx.offset - startOffset < size) {
        items.push(this.itemType.read(ctx));
      }

      ctx.littleEndian = littleEndian;
      return items;
    } else if (typeof count === 'number') {
      const items: TValue[] = new Array(count);
      for (let i = 0; i < count; i++) {
        items[i] = this.itemType.read(ctx);
      }

      ctx.littleEndian = littleEndian;
      return items;
    }

    throw new Error('Either count or size must be provided.');
  }

  write(ctx: EbinContext, value: TValue[]): void {
    const littleEndian = ctx.littleEndian;
    if (typeof this._littleEndian !== 'undefined') {
      ctx.littleEndian = this._littleEndian;
    }

    this._sizeLookup?.write?.(ctx, this.getArraySize(value));
    this._countLookup?.write?.(ctx, value.length);

    for (let i = 0; i < value.length; i++) {
      this.itemType.write(ctx, value[i]);
    }

    ctx.littleEndian = littleEndian;
  }

  count(field: NumberLookupFieldParamType): this {
    this._countLookup = createNumberLookupField(field);
    this.updatePrefixSize();
    return this;
  }

  size(field: NumberLookupFieldParamType): this {
    this._sizeLookup = createNumberLookupField(field);
    this.updatePrefixSize();
    return this;
  }

  private updatePrefixSize() {
    this._prefixSize =
      (this._sizeLookup?.size ?? 0) + (this._countLookup?.size ?? 0);
  }

  preWrite(value: TValue[], parent: any) {
    this._sizeLookup?.preWrite?.(this.getArraySize(value), parent);
    this._countLookup?.preWrite?.(value.length, parent);
  }
}

export function array<TItemSchema extends BaseSchema<any>>(
  itemType: TItemSchema,
): ArraySchema<TItemSchema> {
  return new ArraySchema(itemType);
}
