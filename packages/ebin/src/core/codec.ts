import type { EbinContext } from '../context.js';
import type { SchemaCompileOptions } from '../types.js';
import { Schema } from './schema.js';

interface CodecSchemaOptions<TDecoded, TEncoded> {
  encode(decoded: TDecoded): TEncoded;
  decode(encoded: TEncoded): TDecoded;
}

class CodecSchema<TDecoded, TEncoded> extends Schema<TDecoded, TEncoded> {
  private encodedSchema: Schema<TEncoded, unknown>;

  constructor(
    encodedSchema: Schema<TEncoded>,
    private options: CodecSchemaOptions<TDecoded, TEncoded>,
  ) {
    super();

    this.encodedSchema = encodedSchema.clone();
  }

  get lookups() {
    return this.encodedSchema.lookups;
  }

  get isConstantSize() {
    return this.encodedSchema.isConstantSize;
  }

  compile(options?: SchemaCompileOptions) {
    this.encodedSchema.compile(options);

    super.compile();
  }

  clone() {
    const clone = new CodecSchema(this.encodedSchema, this.options);
    return clone as this;
  }

  getSize(value: TEncoded, parent?: unknown) {
    if (this.isConstantSize) {
      return this.encodedSchema.getSize();
    }

    return this.encodedSchema.getSize(value, parent);
  }

  read(ctx: EbinContext, parent?: unknown) {
    return this.options.decode(this.encodedSchema.read(ctx, parent));
  }

  write(ctx: EbinContext, value: TEncoded, parent?: unknown) {
    return this.encodedSchema.write(ctx, value, parent);
  }

  _writePrepare(value: TEncoded, parent: unknown) {
    this.encodedSchema._writePrepare?.(value, parent);
  }

  _writePreprocess(value: TDecoded, parent?: unknown) {
    return this.encodedSchema._writePreprocess
      ? (this.encodedSchema._writePreprocess(this.options.encode(value), parent) as TEncoded)
      : this.options.encode(value);
  }
}

export function codec<TDecoded, TEncoded>(
  encodedSchema: Schema<TEncoded>,
  options: CodecSchemaOptions<TDecoded, TEncoded>,
) {
  return new CodecSchema(encodedSchema, options);
}
