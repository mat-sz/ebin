import { EbinContext } from '../context.js';
import { Infer } from '../types.js';
import { AnySchema } from './any.js';

type MatchCases<TSchema extends AnySchema<any>> = Record<string, TSchema>;
type MatchObject<T extends MatchCases<any>> =
  T extends MatchCases<infer U> ? U : never;

class MatchSchema<
  TCases extends MatchCases<any>,
  TObject = Infer<MatchObject<TCases>>,
> extends AnySchema<TObject> {
  isConstantSize = false;

  get dependsOnParent() {
    return true;
  }

  constructor(
    readonly matchField: string,
    readonly cases: TCases,
  ) {
    super();
  }

  getSize(value: TObject, parent?: any) {
    return this.cases[parent[this.matchField]].getSize(value, parent);
  }

  read(ctx: EbinContext, parent?: any) {
    return this.cases[parent[this.matchField]].read(ctx, parent);
  }

  write(ctx: EbinContext, value: TObject, parent?: any) {
    this.cases[parent[this.matchField]].write(ctx, value, parent);
  }
}

export function match<TCases extends MatchCases<any>>(
  field: string,
  cases: TCases,
): MatchSchema<TCases> {
  return new MatchSchema(field, cases);
}
