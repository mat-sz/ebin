import type { EbinContext } from '../context.js';
import type { SchemaCompileOptions } from '../types.js';
import { createNumberLookupField, type LookupField, type NumberLookupFieldParamType } from '../utils/lookupField.js';
import { type Schema, SchemaWithEndianness } from './schema.js';

export class ArraySchema<T, TProcessed = T> extends SchemaWithEndianness<T[], TProcessed[]> {
  lookups: {
    size?: LookupField<number>;
    count?: LookupField<number>;
  } = {};

  public elementSchema: Schema<T, TProcessed>;
  private _prefixSize: number = 0;

  get isConstantSize() {
    return !!(this.lookups.size?.isConstant || (this.lookups.count?.isConstant && this.elementSchema.isConstantSize));
  }

  constructor(elementSchema: Schema<T, TProcessed>) {
    super();

    this.elementSchema = elementSchema.clone();
    if (this.elementSchema._writePreprocess) {
      this._writePreprocess = (value: T[], parent?: unknown) => {
        var newValue: TProcessed[] = new Array(value.length);
        for (let i = 0; i < value.length; i++) {
          newValue[i] = this.elementSchema._writePreprocess!(value[i], parent);
        }
        return newValue;
      };
    }
  }

  clone() {
    const clone = new ArraySchema(this.elementSchema);
    clone.isLE = this.isLE;
    clone.lookups = this.cloneLookups();
    return clone as this;
  }

  compile(options?: SchemaCompileOptions) {
    const newOptions: SchemaCompileOptions = {
      ...options,
      isLE: this.isLE ?? options?.isLE,
    };

    this.lookups.count?.compile?.(newOptions);
    this.lookups.size?.compile?.(newOptions);
    this._prefixSize = (this.lookups.size?.size ?? 0) + (this.lookups.count?.size ?? 0);
    this.elementSchema.compile(newOptions);

    super.compile();
  }

  private getArraySize(value: TProcessed[]) {
    if (this.elementSchema.isConstantSize) {
      return value.length * this.elementSchema.getSize(value[0]);
    }

    return value.reduce((byteLength, item) => byteLength + this.elementSchema.getSize(item), 0);
  }

  getSize(value: TProcessed[]) {
    return this._prefixSize + this.getArraySize(value);
  }

  read(ctx: EbinContext, parent?: unknown): T[] {
    const countLookup = this.lookups.count;
    if (countLookup) {
      const count = countLookup.read(ctx, parent);
      const items: T[] = new Array(count);
      for (let i = 0; i < count; i++) {
        items[i] = this.elementSchema.read(ctx);
      }

      return items;
    } else {
      const size = this.lookups.size?.read(ctx, parent) ?? ctx.view.byteLength - ctx.offset;

      const offset = ctx.offset;
      const items: T[] = [];

      while (ctx.offset - offset < size) {
        items.push(this.elementSchema.read(ctx));
      }

      return items;
    }
  }

  write(ctx: EbinContext, value: TProcessed[]): void {
    this.lookups.size?.write?.(ctx, this.getArraySize(value));
    this.lookups.count?.write?.(ctx, value.length);

    for (let i = 0; i < value.length; i++) {
      this.elementSchema.write(ctx, value[i]);
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

  _writePrepare(value: TProcessed[], parent: unknown) {
    this.lookups.size?.preWrite?.(this.getArraySize(value), parent);
    this.lookups.count?.preWrite?.(value.length, parent);
  }
}

export function array<T, TProcessed>(elementSchema: Schema<T, TProcessed>): ArraySchema<T, TProcessed> {
  return new ArraySchema(elementSchema);
}
