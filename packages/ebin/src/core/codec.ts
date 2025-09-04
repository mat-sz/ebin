import { EbinContext } from '../context.js';
import { BaseSchema, SchemaValue } from '../types.js';
import { AnySchema } from './any.js';

interface CodecSchemaOptions<TDecoded, TEncoded> {
  encode(decoded: TDecoded): TEncoded;
  decode(encoded: TEncoded): TDecoded;
}

class CodecSchema<
  TDecoded,
  TEncodedSchema extends BaseSchema<any>,
  TEncoded = SchemaValue<TEncodedSchema>,
> extends AnySchema<TDecoded> {
  isConstantSize = false;

  get lookups() {
    return this.encodedSchema.lookups;
  }

  constructor(
    private encodedSchema: TEncodedSchema,
    private options: CodecSchemaOptions<TDecoded, TEncoded>,
  ) {
    super();
    this.isConstantSize = encodedSchema.isConstantSize;
  }

  getSize(value: TDecoded, parent?: any) {
    if (this.isConstantSize) {
      return this.encodedSchema.getSize();
    }

    return this.encodedSchema.getSize(this.options.encode(value), parent);
  }

  read(ctx: EbinContext, parent?: any) {
    return this.options.decode(this.encodedSchema.read(ctx, parent));
  }

  write(ctx: EbinContext, value: TDecoded, parent?: any) {
    return this.encodedSchema.write(ctx, this.options.encode(value), parent);
  }

  preWrite(value: TDecoded, parent: any) {
    this.encodedSchema.preWrite?.(this.options.encode(value), parent);
  }
}

export function codec<
  TDecoded,
  TEncodedSchema extends BaseSchema<any>,
  TEncoded = SchemaValue<TEncodedSchema>,
>(
  inputSchema: TEncodedSchema,
  options: CodecSchemaOptions<TDecoded, TEncoded>,
) {
  return new CodecSchema(inputSchema, options);
}
