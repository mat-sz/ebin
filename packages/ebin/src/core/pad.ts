import type { EbinContext } from '../context.js';
import type { SchemaCompileOptions } from '../types.js';
import { Schema } from './schema.js';

class PadSchema<T, TProcessed = T> extends Schema<T, TProcessed> {
  private innerSchema: Schema<T, TProcessed>;

  constructor(
    innerSchema: Schema<T, TProcessed>,
    private blockSize: number,
  ) {
    super();

    this.innerSchema = innerSchema.clone();
  }

  clone() {
    const clone = new PadSchema(this.innerSchema, this.blockSize);
    return clone as this;
  }

  compile(options?: SchemaCompileOptions) {
    this.innerSchema.compile(options);

    super.compile();
  }

  get isConstantSize() {
    return this.innerSchema.isConstantSize;
  }

  get lookups() {
    return this.innerSchema.lookups;
  }

  read(ctx: EbinContext, parent?: unknown) {
    const startOffset = ctx.offset;
    const output = this.innerSchema.read(ctx, parent);
    const size = ctx.offset - startOffset;
    const padding = this.blockSize - (size % this.blockSize);
    ctx.offset += padding;
    return output;
  }

  write(ctx: EbinContext, value: TProcessed, parent?: unknown) {
    const startOffset = ctx.offset;
    const output = this.innerSchema.write(ctx, value, parent);
    const size = ctx.offset - startOffset;
    const padding = this.blockSize - (size % this.blockSize);
    ctx.offset += padding;
    return output;
  }

  getSize(value: TProcessed, parent?: unknown) {
    const size = this.innerSchema.getSize(value, parent);
    const padding = this.blockSize - (size % this.blockSize);
    return size + padding;
  }

  _writePrepare(value: TProcessed, parent: unknown) {
    this.innerSchema._writePrepare?.(value, parent);
  }

  _writePreprocess(value: T, parent?: unknown) {
    return this.innerSchema._writePreprocess
      ? this.innerSchema._writePreprocess(value, parent)
      : (value as unknown as TProcessed);
  }
}

export function pad<T, TProcessed>(innerSchema: Schema<T, TProcessed>, blockSize: number): PadSchema<T, TProcessed> {
  return new PadSchema(innerSchema, blockSize);
}
