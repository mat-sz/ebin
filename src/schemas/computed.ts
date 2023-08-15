import { DynamicLengthSchema } from './any.js';

export class ComputedSchema<TInput, TValue> extends DynamicLengthSchema {
  constructor(
    protected parse: (value: TInput) => TValue,
    protected serialize: (value: TValue) => TInput,
  ) {
    super();
  }

  computed<TComputed>(
    parse: (value: TValue) => TComputed,
    serialize: (value: TComputed) => TValue,
  ): ComputedSchema<TInput, TComputed> {
    const newSchema = this as any as ComputedSchema<TInput, TComputed>;
    newSchema.parse = value => parse(this.parse(value));
    newSchema.serialize = value => this.serialize(serialize(value));
    return newSchema;
  }
}
