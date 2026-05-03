import type { EbinContext } from '../context.js';
import type { BaseSchema, ISchemaCompileOptions, LookupField, SchemaValue } from '../types.js';
import { createNumberLookupField, type NumberLookupFieldParamType } from '../utils/lookupField.js';
import { SchemaWithEndianness } from './any.js';

export class ArraySchema<
  TItemSchema extends BaseSchema<any>,
  TValue = SchemaValue<TItemSchema>,
> extends SchemaWithEndianness<TValue[]> {
  lookups: {
    size?: LookupField<number>;
    count?: LookupField<number>;
  } = {};

  public itemType: TItemSchema;
  private _prefixSize: number = 0;

  get isConstantSize() {
    return !!(this.lookups.size?.isConstant || (this.lookups.count?.isConstant && this.itemType.isConstantSize));
  }

  constructor(itemType: TItemSchema) {
    super();

    this.itemType = itemType.clone();
    if (this.itemType._writePreprocess) {
      this._writePreprocess = (value: TValue[], parent?: any) => {
        value = [...value];
        for (let i = 0; i < value.length; i++) {
          value[i] = this.itemType._writePreprocess!(value[i], parent);
        }
        return value;
      };
    }
  }

  clone() {
    const clone = new ArraySchema(this.itemType);
    clone._littleEndian = this._littleEndian;
    clone.lookups = this.cloneLookups();
    return clone as this;
  }

  compile(options?: ISchemaCompileOptions) {
    const newOptions: ISchemaCompileOptions = {
      ...options,
      littleEndian: this._littleEndian ?? options?.littleEndian,
    };

    this.lookups.count?.compile?.(newOptions);
    this.lookups.size?.compile?.(newOptions);
    this._prefixSize = (this.lookups.size?.size ?? 0) + (this.lookups.count?.size ?? 0);
    this.itemType.compile(newOptions);

    super.compile();
  }

  private getArraySize(value: TValue[]) {
    if (this.itemType.isConstantSize) {
      return value.length * this.itemType.getSize(value[0]);
    }

    return value.reduce((byteLength, item) => byteLength + this.itemType.getSize(item), 0);
  }

  getSize(value: TValue[]) {
    return this._prefixSize + this.getArraySize(value);
  }

  read(ctx: EbinContext, parent?: any): TValue[] {
    const countLookup = this.lookups.count;
    if (countLookup) {
      const count = countLookup.read(ctx, parent);
      const items: TValue[] = new Array(count);
      for (let i = 0; i < count; i++) {
        items[i] = this.itemType.read(ctx);
      }

      return items;
    } else {
      const size = this.lookups.size?.read(ctx, parent) ?? ctx.view.byteLength - ctx.offset;

      const offset = ctx.offset;
      const items: TValue[] = [];

      while (ctx.offset - offset < size) {
        items.push(this.itemType.read(ctx));
      }

      return items;
    }
  }

  write(ctx: EbinContext, value: TValue[]): void {
    this.lookups.size?.write?.(ctx, this.getArraySize(value));
    this.lookups.count?.write?.(ctx, value.length);

    for (let i = 0; i < value.length; i++) {
      this.itemType.write(ctx, value[i]);
    }
  }

  count(field: NumberLookupFieldParamType): this {
    this.lookups = {
      count: createNumberLookupField(field),
    };
    return this;
  }

  size(field: NumberLookupFieldParamType): this {
    this.lookups = {
      size: createNumberLookupField(field),
    };
    return this;
  }

  greedy(): this {
    this.lookups = {};
    return this;
  }

  _writePrepare(value: TValue[], parent: any) {
    this.lookups.size?.preWrite?.(this.getArraySize(value), parent);
    this.lookups.count?.preWrite?.(value.length, parent);
  }
}

export function array<TItemSchema extends BaseSchema<any>>(itemType: TItemSchema): ArraySchema<TItemSchema> {
  return new ArraySchema(itemType);
}
