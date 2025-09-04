import { EbinContext } from '../context.js';
import { BaseSchema, SchemaValue } from '../types.js';
import { LookupFieldParent } from '../utils/lookupField.js';
import { AnySchema } from './any.js';

type MatchCases<TSchema extends BaseSchema<any>> = Record<string, TSchema>;
type MatchObject<T extends MatchCases<any>> =
  T extends MatchCases<infer U> ? U : never;

class MatchSchema<
  TCases extends MatchCases<any>,
  TObject = SchemaValue<MatchObject<TCases>>,
> extends AnySchema<TObject> {
  isConstantSize = false;
  lookups;

  constructor(
    readonly matchField: string,
    readonly cases: TCases,
  ) {
    super();
    this.lookups = {
      match: new LookupFieldParent<number>(matchField),
    };
  }

  getSize(value: TObject, parent?: any) {
    // TODO: Fix.
    const matchValue = this.lookups.match.read(undefined as any, parent);
    return this.cases[matchValue].getSize(value, parent);
  }

  read(ctx: EbinContext, parent?: any) {
    const matchValue = this.lookups.match.read(ctx, parent);
    return this.cases[matchValue].read(ctx, parent);
  }

  write(ctx: EbinContext, value: TObject, parent?: any) {
    const matchValue = this.lookups.match.read(ctx, parent);
    this.cases[matchValue].write(ctx, value, parent);
  }
}

export function match<TCases extends MatchCases<any>>(
  field: string,
  cases: TCases,
): MatchSchema<TCases> {
  return new MatchSchema(field, cases);
}
