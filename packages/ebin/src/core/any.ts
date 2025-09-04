import { EbinContext } from '../context.js';
import type { BaseSchema, TypedArray } from '../types.js';

export abstract class AnySchema<T> implements BaseSchema<T> {
  readonly TYPE!: T;
  abstract get isConstantSize(): boolean;

  defaultValue?: T;

  abstract getSize(value?: T, parent?: any): number;
  abstract read(ctx: EbinContext, parent?: any): T;
  abstract write(ctx: EbinContext, value: T, parent?: any): void;

  protected generateFn() {}

  default(value: T) {
    this.defaultValue = value;
    return this;
  }

  fromByteArray(array: TypedArray) {
    return this.read(
      new EbinContext(
        new DataView(
          array.buffer,
          array.byteOffset,
          array.byteOffset + array.byteLength,
        ),
      ),
    );
  }

  toByteArray(value: T): Uint8Array {
    return new Uint8Array(this.toArrayBuffer(value));
  }

  fromArrayBuffer(buffer: ArrayBufferLike) {
    return this.read(new EbinContext(new DataView(buffer)));
  }

  toArrayBuffer(value: T) {
    const buffer = new ArrayBuffer(this.getSize(value));
    this.write(new EbinContext(new DataView(buffer)), value);
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
