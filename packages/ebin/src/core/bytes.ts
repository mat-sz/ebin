import { EbinContext } from '../context.js';
import { LookupField, TypedArray } from '../types.js';
import {
  createNumberLookupField,
  NumberLookupFieldParamType,
} from '../utils/lookupField.js';
import { AnySchema } from './any.js';

export abstract class BytesSchema<T> extends AnySchema<T, Uint8Array> {
  isConstantSize = false;
  lookups: {
    size?: LookupField<number>;
  } = {};

  getSize(value: Uint8Array) {
    const sizeLookup = this.lookups.size;
    if (!sizeLookup?.size) {
      return value.byteLength;
    }

    if (sizeLookup.isConstant) {
      // TODO: Fix.
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

  protected readArray(ctx: EbinContext, parent?: any): Uint8Array {
    const size =
      this.lookups.size?.read(ctx, parent) ?? ctx.view.byteLength - ctx.offset;

    const offset = ctx.offset;
    ctx.offset += size;
    return ctx.array.slice(offset, offset + size);
  }

  write(ctx: EbinContext, value: Uint8Array): void {
    this.lookups.size?.write?.(ctx, value.byteLength);

    ctx.array.set(value, ctx.offset);
    ctx.offset += value.byteLength;
  }

  _writePrepare(value: Uint8Array, parent: any) {
    this.lookups.size?.preWrite?.(this.getSize(value), parent);
  }
}

class ArrayBufferSchema extends BytesSchema<ArrayBuffer> {
  read(ctx: EbinContext, parent?: any): ArrayBuffer {
    return this.readArray(ctx, parent).buffer as ArrayBuffer;
  }

  _writePreprocess(value: ArrayBuffer) {
    return new Uint8Array(value);
  }
}

export function arrayBuffer(): ArrayBufferSchema {
  return new ArrayBufferSchema();
}
