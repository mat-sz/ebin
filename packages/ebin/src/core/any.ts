import { EbinContext } from '../context.js';
import type { BaseSchema, TypedArray } from '../types.js';

export abstract class AnySchema<T, TProcessed = T>
  implements BaseSchema<T, TProcessed>
{
  readonly TYPE!: T;
  abstract get isConstantSize(): boolean;

  defaultValue?: T;

  abstract getSize(value?: TProcessed, parent?: any): number;
  abstract read(ctx: EbinContext, parent?: any): T;
  abstract write(ctx: EbinContext, value: TProcessed, parent?: any): void;

  _writePreprocess?(value: T, parent?: any): TProcessed;
  _writePrepare?(value: TProcessed, parent?: any): void;

  protected generateFn() {}

  default(value: T) {
    this.defaultValue = value;
    return this;
  }

  fromByteArray(array: TypedArray) {
    return this.read(EbinContext.fromTypedArray(array));
  }

  toByteArray(value: T): Uint8Array {
    return new Uint8Array(this.toArrayBuffer(value));
  }

  fromArrayBuffer(buffer: ArrayBufferLike) {
    return this.read(EbinContext.fromArrayBuffer(buffer));
  }

  toArrayBuffer(value: T) {
    const temp: any = this._writePreprocess
      ? this._writePreprocess(value)
      : value;
    const buffer = new ArrayBuffer(this.getSize(temp));
    this.write(EbinContext.fromArrayBuffer(buffer), temp);
    return buffer;
  }
}

export abstract class ConstantSizeSchema<T> extends AnySchema<T> {
  isConstantSize = true;

  constructor(public readonly size: number) {
    super();
  }

  getSize() {
    return this.size;
  }
}

export abstract class SchemaWithEndianness<T> extends AnySchema<T> {
  protected _littleEndian?: boolean;

  littleEndian(): this {
    this._littleEndian = true;
    this.generateFn();
    return this;
  }

  bigEndian(): this {
    this._littleEndian = false;
    this.generateFn();
    return this;
  }
}
