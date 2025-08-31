import { EbinContext } from '../context.js';
import { AnySchema } from '../core/any.js';

export interface LookupField<T> {
  readonly dependsOnParent: boolean;
  readonly size: number;
  readonly isConstant: boolean;

  read(ctx: EbinContext, parent?: any): T;
  write?: (ctx: EbinContext, value: T, parent?: any) => void;
  preWrite?: (value: T, parent: any) => void;
}

export class LookupFieldParent<T> implements LookupField<T> {
  readonly dependsOnParent = true;
  readonly size = 0;
  readonly isConstant = false;

  constructor(private field: string) {}

  read(_: EbinContext, parent?: any) {
    return parent?.[this.field];
  }

  preWrite(value: T, parent: any) {
    parent[this.field] = value;
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

  constructor(private schema: AnySchema<T>) {
    this.size = schema.getSize();
  }

  read(ctx: EbinContext, parent?: any) {
    return this.schema.read(ctx, parent);
  }

  write(ctx: EbinContext, value: T, parent?: any) {
    return this.schema.write(ctx, value, parent);
  }
}

export type NumberLookupFieldParamType = string | number | AnySchema<number>;

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
