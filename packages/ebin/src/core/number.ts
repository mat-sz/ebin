import { ConstantSizeSchema, SchemaWithEndianness } from './any.js';

class NumberSchema<T extends bigint | number> extends SchemaWithEndianness<T> {
  isConstantSize = true;

  constructor(
    public readonly size: number,
    protected readonly viewSuffix: string,
  ) {
    super();
    this.generateFn();
  }

  protected generateFn() {
    const hasEndianness = typeof this._littleEndian !== 'undefined';

    this.read = new Function(
      'ctx',
      `"use strict";
      const offset = ctx.offset;
      ctx.offset += ${this.size};
      return ctx.view.get${this.viewSuffix}(offset, ${hasEndianness ? JSON.stringify(this._littleEndian) : `ctx.littleEndian`});
      `,
    ).bind(this);
    this.write = new Function(
      'ctx',
      'value',
      `"use strict";
      const offset = ctx.offset;
      ctx.offset += ${this.size};
      return ctx.view.set${this.viewSuffix}(offset, value, ${hasEndianness ? JSON.stringify(this._littleEndian) : `ctx.littleEndian`});
      `,
    ).bind(this);
  }

  read() {
    return 0 as any;
  }

  write() {}

  getSize() {
    return this.size;
  }
}

class ByteNumberSchema extends ConstantSizeSchema<number> {
  constructor(protected readonly viewSuffix: string) {
    super(1);
    this.generateFn();
  }

  protected generateFn() {
    this.read = new Function(
      'ctx',
      `"use strict";
       return ctx.view.get${this.viewSuffix}(ctx.offset++);
       `,
    ).bind(this);
    this.write = new Function(
      'ctx',
      'value',
      `"use strict";
       ctx.view.set${this.viewSuffix}(ctx.offset++, value);
       `,
    ).bind(this);
  }

  read() {
    return 0;
  }

  write() {}
}

export function int8() {
  return new ByteNumberSchema('Int8');
}

export function uint8() {
  return new ByteNumberSchema('Uint8');
}

export function int16() {
  return new NumberSchema<number>(2, 'Int16');
}

export function uint16() {
  return new NumberSchema<number>(2, 'Uint16');
}

export function int32() {
  return new NumberSchema<number>(4, 'Int32');
}

export function uint32() {
  return new NumberSchema<number>(4, 'Uint32');
}

export function bigint64() {
  return new NumberSchema<bigint>(8, 'BigInt64');
}

export function biguint64() {
  return new NumberSchema<bigint>(8, 'BigUint64');
}

export function float16() {
  return new NumberSchema<number>(2, 'Float16');
}

export function float32() {
  return new NumberSchema<number>(4, 'Float32');
}

export function float64() {
  return new NumberSchema<number>(8, 'Float64');
}
