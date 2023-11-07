import { BaseSchema, BaseReader, BaseWriter, ReadContext } from '../types.js';

export class AnySchema<T = any> implements BaseSchema<T> {
  primitiveType: string | undefined = undefined;
  readonly TYPE!: T;
  get isConstantSize(): boolean {
    return false;
  }

  getCount(): number {
    return 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getByteLength(value?: T): number {
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  read(reader: BaseReader, context?: ReadContext): T {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  write(writer: BaseWriter, value: T): void {
    throw new Error('Not implemented');
  }

  clone(): this {
    throw new Error('Not implemented');
  }

  computed<TComputed>(
    parse: (value: T) => TComputed,
    serialize: (value: TComputed) => T,
  ): ComputedSchema<T, TComputed> {
    return new ComputedSchema(this, parse, serialize);
  }
}

export class DynamicLengthSchema<T = any> extends AnySchema<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCount(value?: T): number {
    return 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getByteLength(value?: T): number {
    return 0;
  }
}

export class ComputedSchema<TInput, TValue> extends AnySchema<TValue> {
  constructor(
    protected inputSchema: AnySchema<TInput>,
    protected parse: (value: TInput) => TValue,
    protected serialize: (value: TValue) => TInput,
  ) {
    super();
  }

  getByteLength(value: TValue): number {
    return this.inputSchema.getByteLength(this.serialize(value));
  }

  read(reader: BaseReader, context?: ReadContext): TValue {
    const input = this.inputSchema.read(reader, context);
    return this.parse(input);
  }

  write(writer: BaseWriter, value: TValue): void {
    this.inputSchema.write(writer, this.serialize(value));
  }
}
