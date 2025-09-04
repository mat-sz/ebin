import { EbinContext } from '../context.js';
import { LookupField, TypedArray } from '../types.js';
import {
  createNumberLookupField,
  NumberLookupFieldParamType,
} from '../utils/lookupField.js';
import { AnySchema } from './any.js';

export abstract class BaseBytesSchema<T> extends AnySchema<T> {
  isConstantSize = false;
  lookups: {
    size?: LookupField<number>;
  } = {};

  protected getBufferSize(value: ArrayBufferLike | TypedArray) {
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

  protected readBuffer(ctx: EbinContext, parent?: any): ArrayBuffer {
    const size =
      this.lookups.size?.read(ctx, parent) ?? ctx.view.byteLength - ctx.offset;

    const offset = ctx.offset;
    ctx.offset += size;
    return ctx.view.buffer.slice(offset, offset + size) as ArrayBuffer;
  }

  protected writeBuffer(ctx: EbinContext, value: ArrayBufferLike): void {
    this.lookups.size?.write?.(ctx, value.byteLength);

    const array = new Uint8Array(ctx.view.buffer);
    array.set(new Uint8Array(value), ctx.offset);
    ctx.offset += value.byteLength;
  }

  preWrite(value: T, parent: any) {
    this.lookups.size?.preWrite?.(this.getSize(value, parent), parent);
  }
}

abstract class BytesSchema<
  T extends ArrayBuffer | TypedArray,
> extends BaseBytesSchema<T> {
  getSize(value: T) {
    return this.getBufferSize(value);
  }
}

class ArrayBufferSchema extends BytesSchema<ArrayBuffer> {
  read(ctx: EbinContext, parent?: any): ArrayBuffer {
    return this.readBuffer(ctx, parent);
  }

  write(ctx: EbinContext, value: ArrayBufferLike): void {
    this.writeBuffer(ctx, value);
  }
}

export function arrayBuffer(): ArrayBufferSchema {
  return new ArrayBufferSchema();
}
