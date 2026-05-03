import { EbinContext } from '../context.js';
import type { SchemaCompileOptions, TypedArray } from '../types.js';
import type { LookupField } from '../utils/lookupField.js';

export type SchemaValue<T extends Schema> = T['valueType'];

export abstract class Schema<T = unknown, TProcessed = T> {
  readonly valueType!: T;
  abstract get isConstantSize(): boolean;
  abstract get lookups(): Record<string, LookupField<unknown> | undefined> | undefined;

  defaultValue?: T;

  abstract clone(): this;

  _writePreprocess?(value: T, parent?: unknown): TProcessed;
  _writePrepare?(value: TProcessed, parent?: unknown): void;

  protected cloneLookups(): this['lookups'] {
    if (!this.lookups) {
      return undefined;
    }

    return Object.fromEntries(Object.entries(this.lookups).map(([key, value]) => [key, value?.clone()]));
  }

  compile(options?: SchemaCompileOptions | undefined): void;
  compile() {
    if (this._writePreprocess) {
      this.toArrayBuffer = (value: T) => {
        const temp = this._writePreprocess!(value);
        const buffer = new ArrayBuffer(this.getSize(temp));
        this.write(EbinContext.fromArrayBuffer(buffer), temp);
        return buffer;
      };
    } else {
      this.toArrayBuffer = (value: T) => {
        const buffer = new ArrayBuffer(this.getSize(value as unknown as TProcessed));
        this.write(EbinContext.fromArrayBuffer(buffer), value as unknown as TProcessed);
        return buffer;
      };
    }
  }

  read(ctx: EbinContext, parent?: unknown): T {
    this.compile();
    return this.read(ctx, parent);
  }

  write(ctx: EbinContext, value: TProcessed, parent?: unknown) {
    this.compile();
    this.write(ctx, value, parent);
  }

  getSize(value?: TProcessed, parent?: unknown): number {
    this.compile();
    return this.getSize(value, parent);
  }

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

  toArrayBuffer(value: T): ArrayBuffer {
    this.compile();
    return this.toArrayBuffer(value);
  }
}

export abstract class ConstantSizeSchema<T> extends Schema<T> {
  isConstantSize = true;

  constructor(public readonly size: number) {
    super();
  }

  getSize() {
    return this.size;
  }
}

export abstract class SchemaWithEndianness<T, TProcessed = T> extends Schema<T, TProcessed> {
  protected isLE?: boolean = undefined;

  littleEndian(): this {
    this.isLE = true;
    return this;
  }

  bigEndian(): this {
    this.isLE = false;
    return this;
  }

  le(): this {
    return this.littleEndian();
  }

  be(): this {
    return this.bigEndian();
  }
}
