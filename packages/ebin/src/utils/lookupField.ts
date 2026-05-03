import type { EbinContext } from '../context.js';
import type { BaseSchema, ISchemaCompileOptions, LookupField } from '../types.js';

export class LookupFieldParent<T> implements LookupField<T> {
  readonly dependsOnParent = true;
  readonly size = 0;
  readonly isConstant = false;

  constructor(public readonly parentField: string) {}

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

export class LookupFieldConstant<T> implements LookupField<T> {
  readonly dependsOnParent = false;
  readonly size = 0;
  readonly isConstant = true;

  constructor(private value: T) {}

  clone(): this {
    const clone = new LookupFieldConstant<T>(this.value);
    return clone as this;
  }

  read() {
    return this.value;
  }
}

export class LookupFieldPrefix<T> implements LookupField<T> {
  readonly dependsOnParent = false;
  schema: BaseSchema<T>;
  size = 0;
  readonly isConstant = false;

  constructor(schema: BaseSchema<T>) {
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

  compile(options?: ISchemaCompileOptions) {
    this.schema.compile(options);
  }

  read(ctx: EbinContext, parent?: any) {
    return this.schema.read(ctx, parent);
  }

  write(ctx: EbinContext, value: T, parent?: any) {
    return this.schema.write(ctx, value, parent);
  }
}

export type NumberLookupFieldParamType = string | number | BaseSchema<number>;

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
