import { EbinContext } from '../context.js';
import { TypedArray } from '../types.js';
import {
  createNumberLookupField,
  LookupField,
  NumberLookupFieldParamType,
} from '../utils/lookupField.js';
import { AnySchema } from './any.js';

export abstract class BaseBytesSchema<T> extends AnySchema<T> {
  isConstantSize = false;
  private _sizeLookup?: LookupField<number>;

  get dependsOnParent() {
    return !!this._sizeLookup?.dependsOnParent;
  }

  protected getBufferSize(value: ArrayBufferLike | TypedArray) {
    if (!this._sizeLookup) {
      return value.byteLength;
    }

    if (this._sizeLookup.isConstant) {
      // TODO: Fix.
      return this._sizeLookup.read(undefined as any);
    }

    return this._sizeLookup.size + value.byteLength;
  }

  size(field: NumberLookupFieldParamType): this {
    this._sizeLookup = createNumberLookupField(field);
    this.isConstantSize = this._sizeLookup.isConstant;
    return this;
  }

  protected readBuffer(ctx: EbinContext, parent?: any): ArrayBuffer {
    const size =
      this._sizeLookup?.read(ctx, parent) ?? ctx.view.byteLength - ctx.offset;

    const offset = ctx.offset;
    ctx.offset += size;
    return ctx.view.buffer.slice(offset, offset + size) as ArrayBuffer;
  }

  protected writeBuffer(ctx: EbinContext, value: ArrayBufferLike): void {
    this._sizeLookup?.write?.(ctx, value.byteLength);

    const array = new Uint8Array(ctx.view.buffer);
    array.set(new Uint8Array(value), ctx.offset);
    ctx.offset += value.byteLength;
  }

  preWrite(value: T, parent: any) {
    this._sizeLookup?.preWrite?.(this.getSize(value, parent), parent);
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
