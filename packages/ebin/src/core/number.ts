import type { EbinContext } from '../context.js';
import type { SchemaCompileOptions } from '../types.js';
import { fn } from '../utils/codegen.js';
import { fromFloat16, IS_FP16_SUPPORTED, toFloat16 } from '../utils/float16.js';
import { ConstantSizeSchema, SchemaWithEndianness } from './schema.js';

class NumberSchema<T extends bigint | number> extends SchemaWithEndianness<T> {
  isConstantSize = true;
  lookups = undefined;

  constructor(
    public readonly size: number,
    protected readonly viewSuffix: string,
  ) {
    super();
  }

  clone() {
    const clone = new NumberSchema(this.size, this.viewSuffix);
    return clone as this;
  }

  compile(options?: SchemaCompileOptions) {
    const isLE = this.isLE ?? options?.isLE ?? undefined;

    if (this.viewSuffix === 'Float16' && !IS_FP16_SUPPORTED) {
      this.read = (ctx: EbinContext) => {
        return fromFloat16(ctx.view.getUint16(ctx.forward(2), isLE)) as T;
      };
      this.write = (ctx: EbinContext, value: T) => {
        ctx.view.setUint16(ctx.forward(2), toFloat16(value as number), isLE);
      };
    } else {
      this.read = fn('ctx')
        .line(`return ctx.view.get${this.viewSuffix}(ctx.forward(${this.size}), ${JSON.stringify(isLE)});`)
        .generate(this);
      this.write = fn('ctx', 'value')
        .line(`ctx.view.set${this.viewSuffix}(ctx.forward(${this.size}), value, ${JSON.stringify(isLE)});`)
        .generate(this);
    }

    super.compile();
  }

  getSize() {
    return this.size;
  }
}

class ByteNumberSchema extends ConstantSizeSchema<number> {
  lookups = undefined;

  constructor(protected readonly viewSuffix: string) {
    super(1);
  }

  clone() {
    const clone = new ByteNumberSchema(this.viewSuffix);
    return clone as this;
  }

  compile() {
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

    super.compile();
  }
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
