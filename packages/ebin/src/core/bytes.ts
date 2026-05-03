import type { EbinContext } from '../context.js';
import type { SchemaCompileOptions } from '../types.js';
import { createNumberLookupField, type LookupField, type NumberLookupFieldParamType } from '../utils/lookupField.js';
import { Schema } from './schema.js';

export abstract class BytesSchema<T> extends Schema<T, Uint8Array> {
  isConstantSize = false;
  lookups: {
    size?: LookupField<number>;
  } = {};

  compile(options?: SchemaCompileOptions) {
    this.lookups.size?.compile?.(options);

    super.compile();
  }

  getSize(value: Uint8Array) {
    const sizeLookup = this.lookups.size;
    if (!sizeLookup?.size) {
      return value.byteLength;
    }

    if (sizeLookup.isConstant) {
      return sizeLookup.read(undefined as any);
    }

    return sizeLookup.size + value.byteLength;
  }

  size(field: NumberLookupFieldParamType): this {
    const sizeLookup = createNumberLookupField(field);
    this.lookups.size = sizeLookup;
    this.isConstantSize = sizeLookup.isConstant;
    return this;
  }

  protected readArray(ctx: EbinContext, parent?: unknown): Uint8Array {
    const size = this.lookups.size?.read(ctx, parent) ?? ctx.view.byteLength - ctx.offset;

    return ctx.bytes(size);
  }

  write(ctx: EbinContext, value: Uint8Array): void {
    this.lookups.size?.write?.(ctx, value.byteLength);

    ctx.array.set(value, ctx.offset);
    ctx.offset += value.byteLength;
  }

  _writePrepare(value: Uint8Array, parent: unknown) {
    this.lookups.size?.preWrite?.(this.getSize(value), parent);
  }
}

class ArrayBufferSchema extends BytesSchema<ArrayBuffer> {
  clone() {
    const clone = new ArrayBufferSchema();
    clone.lookups = this.cloneLookups();
    return clone as this;
  }

  read(ctx: EbinContext, parent?: unknown): ArrayBuffer {
    return this.readArray(ctx, parent).buffer as ArrayBuffer;
  }

  _writePreprocess(value: ArrayBuffer) {
    return new Uint8Array(value);
  }
}

export function arrayBuffer(): ArrayBufferSchema {
  return new ArrayBufferSchema();
}
