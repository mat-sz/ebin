import { EbinContext } from '../context.js';
import type { BaseSchema, LookupField, TypedArray } from '../types.js';

export abstract class AnySchema<T, TProcessed = T> implements BaseSchema<T, TProcessed> {
  readonly TYPE!: T;
  abstract get isConstantSize(): boolean;

  defaultValue?: T;

  abstract clone(): this;

  _writePreprocess?(value: T, parent?: any): TProcessed;
  _writePrepare?(value: TProcessed, parent?: any): void;

  protected cloneLookups(): any {
    if (!('lookups' in this) || !this.lookups) {
      return undefined;
    }

    const lookups = this.lookups as Record<string, LookupField<any> | undefined>;
    return Object.fromEntries(Object.entries(lookups).map(([key, value]) => [key, value?.clone()]));
  }

  compile() {
    if (this._writePreprocess) {
      this.toArrayBuffer = (value: T) => {
        var temp = this._writePreprocess!(value);
        var buffer = new ArrayBuffer(this.getSize(temp));
        this.write(EbinContext.fromArrayBuffer(buffer), temp);
        return buffer;
      };
    } else {
      this.toArrayBuffer = (value: T) => {
        var buffer = new ArrayBuffer(this.getSize(value as any));
        this.write(EbinContext.fromArrayBuffer(buffer), value as any);
        return buffer;
      };
    }
  }

  read(ctx: EbinContext, parent?: any): T {
    this.compile();
    return this.read(ctx, parent);
  }

  write(ctx: EbinContext, value: TProcessed, parent?: any) {
    this.compile();
    this.write(ctx, value, parent);
  }

  getSize(value?: TProcessed, parent?: any): number {
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
    return this;
  }

  bigEndian(): this {
    this._littleEndian = false;
    return this;
  }
}
