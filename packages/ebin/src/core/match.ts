import type { EbinContext } from '../context.js';
import type { SchemaCompileOptions } from '../types.js';
import { type LookupField, LookupFieldParent } from '../utils/lookupField.js';
import { Schema, type SchemaValue } from './schema.js';

type MatchCases<T> = Record<string, Schema<T>>;
type MatchObject<T extends MatchCases<any>> = T extends MatchCases<infer U> ? U : never;

class MatchSchema<Cases extends MatchCases<any>, T = SchemaValue<MatchObject<Cases>>> extends Schema<T> {
  isConstantSize = false;
  lookups: {
    match: LookupField<number>;
  };
  cases: Cases;

  constructor(
    readonly matchField: string,
    cases: Cases,
  ) {
    super();
    this.lookups = {
      match: new LookupFieldParent<number>(matchField),
    };
    this.cases = Object.fromEntries(Object.entries(cases).map(([key, value]) => [key, value.clone()])) as Cases;
  }

  clone() {
    const clone = new MatchSchema(this.matchField, this.cases);
    return clone as this;
  }

  compile(options?: SchemaCompileOptions) {
    this.lookups.match.compile?.(options);

    super.compile();
  }

  getSize(value: T, parent?: unknown) {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    return this.cases[matchValue].getSize(value, parent);
  }

  read(ctx: EbinContext, parent?: unknown) {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    return this.cases[matchValue].read(ctx, parent);
  }

  write(ctx: EbinContext, value: T, parent?: unknown) {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    this.cases[matchValue].write(ctx, value, parent);
  }

  _writePrepare?(value: T, parent?: unknown) {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    const schema = this.cases[matchValue];
    return schema._writePrepare ? schema._writePrepare(value, parent) : value;
  }

  _writePreprocess?(value: T, parent?: unknown) {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    const schema = this.cases[matchValue];
    return schema._writePreprocess ? schema._writePreprocess(value, parent) : value;
  }
}

export function match<TCases extends MatchCases<any>>(field: string, cases: TCases): MatchSchema<TCases> {
  return new MatchSchema(field, cases);
}
