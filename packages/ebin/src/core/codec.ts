import { EbinContext } from '../context.js';
import { BaseSchema, Infer } from '../types.js';
import { AnySchema } from './any.js';

interface CodecSchemaOptions<TDecoded, TEncoded> {
  encode(decoded: TDecoded): TEncoded;
  decode(encoded: TEncoded): TDecoded;
}

class CodecSchema<
  TDecoded,
  TEncodedSchema extends BaseSchema<any>,
  TEncoded = Infer<TEncodedSchema>,
> extends AnySchema<TDecoded> {
  isConstantSize = false;

  constructor(
    private encodedSchema: TEncodedSchema,
    private options: CodecSchemaOptions<TDecoded, TEncoded>,
  ) {
    super();
    this.isConstantSize = encodedSchema.isConstantSize;
  }

  getSize(value: TDecoded) {
    if (this.isConstantSize) {
      return this.encodedSchema.getSize();
    }

    return this.encodedSchema.getSize(this.options.encode(value));
  }

  read(ctx: EbinContext, parent?: any) {
    return this.options.decode(this.encodedSchema.read(ctx, parent));
  }

  write(ctx: EbinContext, value: TDecoded) {
    return this.encodedSchema.write(ctx, this.options.encode(value));
  }
}

export function codec<
  TDecoded,
  TEncodedSchema extends BaseSchema<any>,
  TEncoded = Infer<TEncodedSchema>,
>(
  inputSchema: TEncodedSchema,
  options: CodecSchemaOptions<TDecoded, TEncoded>,
) {
  return new CodecSchema(inputSchema, options);
}
