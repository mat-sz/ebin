import type { EbinContext } from '../context.js';
import type { Schema } from '../core/schema.js';
import type { SchemaCompileOptions } from '../types.js';

export abstract class LookupField<T> {
  abstract readonly dependsOnParent: boolean;
  abstract readonly size: number;
  abstract readonly isConstant: boolean;

  abstract clone(): this;
  compile?(options?: SchemaCompileOptions | undefined): void;

  abstract read(_: EbinContext, parent?: any): T;
  preWrite?(value: T, parent: any): void;
  write?(ctx: EbinContext, value: T, parent?: any): void;
}

export class LookupFieldParent<T> extends LookupField<T> {
  readonly dependsOnParent = true;
  readonly size = 0;
  readonly isConstant = false;

  constructor(public readonly parentField: string) {
    super();
  }

  clone(): this {
    const clone = new LookupFieldParent<T>(this.parentField);
    return clone as this;
  }

  read(_: EbinContext, parent?: any) {
    return parent?.[this.parentField];
  }

  preWrite(value: T, parent: any) {
    parent[this.parentField] = value;
  }
}

export class LookupFieldConstant<T> extends LookupField<T> {
  readonly dependsOnParent = false;
  readonly size = 0;
  readonly isConstant = true;

  constructor(private value: T) {
    super();
  }

  clone(): this {
    const clone = new LookupFieldConstant<T>(this.value);
    return clone as this;
  }

  read() {
    return this.value;
  }
}

export class LookupFieldPrefix<T> extends LookupField<T> {
  readonly dependsOnParent = false;
  schema: Schema<T>;
  size = 0;
  readonly isConstant = false;

  constructor(schema: Schema<T>) {
    super();

    this.schema = schema.clone();
    if (!this.schema.isConstantSize) {
      throw new Error('Lookup field schema must be constant size.');
    }

    this.size = this.schema.getSize();
  }

  clone(): this {
    const clone = new LookupFieldPrefix<T>(this.schema);
    return clone as this;
  }

  compile(options?: SchemaCompileOptions) {
    this.schema.compile(options);
  }

  read(ctx: EbinContext, parent?: unknown) {
    return this.schema.read(ctx, parent);
  }

  write(ctx: EbinContext, value: T, parent?: unknown) {
    return this.schema.write(ctx, value, parent);
  }
}

export type NumberLookupFieldParamType = string | number | Schema<number>;

export function createNumberLookupField(field: NumberLookupFieldParamType): LookupField<number> {
  switch (typeof field) {
    case 'string':
      return new LookupFieldParent(field);
    case 'number':
      return new LookupFieldConstant(field);
    default:
      return new LookupFieldPrefix(field);
  }
}
