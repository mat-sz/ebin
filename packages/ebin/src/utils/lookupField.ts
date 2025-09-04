import { EbinContext } from '../context.js';
import { BaseSchema, LookupField } from '../types.js';

export class LookupFieldParent<T> implements LookupField<T> {
  readonly dependsOnParent = true;
  readonly size = 0;
  readonly isConstant = false;

  constructor(public readonly parentField: string) {}

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

  read() {
    return this.value;
  }
}

export class LookupFieldPrefix<T> implements LookupField<T> {
  readonly dependsOnParent = false;
  size = 0;
  readonly isConstant = false;

  constructor(private schema: BaseSchema<T>) {
    this.size = schema.getSize();
  }

  read(ctx: EbinContext, parent?: any) {
    return this.schema.read(ctx, parent);
  }

  write(ctx: EbinContext, value: T, parent?: any) {
    return this.schema.write(ctx, value, parent);
  }
}

export type NumberLookupFieldParamType = string | number | BaseSchema<number>;

export function createNumberLookupField(
  field: NumberLookupFieldParamType,
): LookupField<number> {
  switch (typeof field) {
    case 'string':
      return new LookupFieldParent(field);
    case 'number':
      return new LookupFieldConstant(field);
    default:
      return new LookupFieldPrefix(field);
  }
}
