import { EbinContext } from '../context.js';
import { TypedArray } from '../types.js';
import { AnySchema } from './any.js';

export abstract class BaseBytesSchema<T> extends AnySchema<T> {
  isConstantSize = false;
  sizeField?: string;
  sizeSchema?: AnySchema<number>;
  fixedSize?: number;

  get dependsOnParent() {
    return !!this.sizeField;
  }

  protected getBufferSize(value: ArrayBufferLike | TypedArray) {
    return (
      this.fixedSize ?? (this.sizeSchema?.getSize() ?? 0) + value.byteLength
    );
  }

  size(field: string | number | AnySchema<number>): this {
    this.sizeSchema = undefined;
    this.sizeField = undefined;
    this.fixedSize = undefined;
    this.isConstantSize = false;

    switch (typeof field) {
      case 'string':
        this.sizeField = field;
        break;
      case 'number':
        this.fixedSize = field;
        this.isConstantSize = true;
        break;
      default:
        this.sizeSchema = field;
    }

    return this;
  }

  private readSize(ctx: EbinContext, parent?: any) {
    if (this.fixedSize) {
      return this.fixedSize;
    }

    if (this.sizeField) {
      return parent?.[this.sizeField!];
    }

    if (this.sizeSchema) {
      return this.sizeSchema.read(ctx, parent);
    }
  }

  protected readBuffer(ctx: EbinContext, parent?: any): ArrayBuffer {
    const size = this.readSize(ctx, parent);
    if (typeof size !== 'number') {
      throw new Error('Invalid size');
    }

    const offset = ctx.offset;
    ctx.offset += size;
    return ctx.view.buffer.slice(offset, offset + size) as ArrayBuffer;
  }

  protected writeBuffer(ctx: EbinContext, value: ArrayBufferLike): void {
    this.sizeSchema?.write(ctx, value.byteLength);
    const array = new Uint8Array(ctx.view.buffer);
    array.set(new Uint8Array(value), ctx.offset);
    ctx.offset += value.byteLength;
  }

  preWrite(value: T, parent: any) {
    if (this.sizeField) {
      parent[this.sizeField] = this.getSize(value);
    }
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
