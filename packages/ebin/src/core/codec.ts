import type { EbinContext } from '../context.js';
import type { BaseSchema, ISchemaCompileOptions, SchemaValue } from '../types.js';
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
  private encodedSchema: TEncodedSchema;

  get lookups() {
    return this.encodedSchema.lookups;
  }

  constructor(
    encodedSchema: TEncodedSchema,
    private options: CodecSchemaOptions<TDecoded, TEncoded>,
  ) {
    super();

    this.encodedSchema = encodedSchema.clone();
    this.isConstantSize = this.encodedSchema.isConstantSize;
  }

  compile(options?: ISchemaCompileOptions) {
    this.encodedSchema.compile(options);

    super.compile();
  }

  clone() {
    const clone = new CodecSchema(this.encodedSchema, this.options);
    return clone as this;
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

export function codec<TDecoded, TEncodedSchema extends BaseSchema<any>, TEncoded = SchemaValue<TEncodedSchema>>(
  inputSchema: TEncodedSchema,
  options: CodecSchemaOptions<TDecoded, TEncoded>,
) {
  return new CodecSchema(inputSchema, options);
}
