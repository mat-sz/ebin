import type { EbinContext } from '../context.js';
import type { BaseSchema, ISchemaCompileOptions, LookupField, SchemaValue } from '../types.js';
import { LookupFieldParent } from '../utils/lookupField.js';
import { AnySchema } from './any.js';

type MatchCases<TSchemaType> = Record<string, BaseSchema<TSchemaType>>;
type MatchObject<T extends MatchCases<any>> = T extends MatchCases<infer U> ? U : never;

class MatchSchema<
  TCases extends MatchCases<any>,
  TObject = SchemaValue<MatchObject<TCases>>,
> extends AnySchema<TObject> {
  isConstantSize = false;
  lookups: {
    match: LookupField<number>;
  };
  cases: TCases;

  constructor(
    readonly matchField: string,
    cases: TCases,
  ) {
    super();
    this.lookups = {
      match: new LookupFieldParent<number>(matchField),
    };
    this.cases = Object.fromEntries(Object.entries(cases).map(([key, value]) => [key, value.clone()])) as TCases;
  }

  clone() {
    const clone = new MatchSchema(this.matchField, this.cases);
    return clone as this;
  }

  compile(options?: ISchemaCompileOptions) {
    this.lookups.match.compile?.(options);

    super.compile();
  }

  getSize(value: TObject, parent?: any) {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    return this.cases[matchValue].getSize(value, parent);
  }

  read(ctx: EbinContext, parent?: any) {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    return this.cases[matchValue].read(ctx, parent);
  }

  write(ctx: EbinContext, value: TObject, parent?: any) {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    this.cases[matchValue].write(ctx, value, parent);
  }

  _writePrepare?(value: TObject, parent?: any): any {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    const schema = this.cases[matchValue];
    return schema._writePrepare ? schema._writePrepare(value, parent) : value;
  }

  _writePreprocess?(value: TObject, parent?: any): any {
    const matchValue = this.lookups.match.read(undefined as any, parent);
    const schema = this.cases[matchValue];
    return schema._writePreprocess ? schema._writePreprocess(value, parent) : value;
  }
}

export function match<TCases extends MatchCases<any>>(field: string, cases: TCases): MatchSchema<TCases> {
  return new MatchSchema(field, cases);
}
