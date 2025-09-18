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
> extends AnySchema<TDecoded, TEncoded> {
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

  getSize(value: TEncoded, parent?: any) {
    if (this.isConstantSize) {
      return this.encodedSchema.getSize();
    }

    return this.encodedSchema.getSize(value, parent);
  }

  read(ctx: EbinContext, parent?: any) {
    return this.options.decode(this.encodedSchema.read(ctx, parent));
  }

  write(ctx: EbinContext, value: TEncoded, parent?: any) {
    return this.encodedSchema.write(ctx, value, parent);
  }

  _writePrepare(value: TEncoded, parent: any) {
    this.encodedSchema._writePrepare?.(value, parent);
  }

  _writePreprocess(value: TDecoded, parent?: any) {
    return this.encodedSchema._writePreprocess
      ? this.encodedSchema._writePreprocess(this.options.encode(value), parent)
      : this.options.encode(value);
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
