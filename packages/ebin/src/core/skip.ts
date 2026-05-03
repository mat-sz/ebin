import type { EbinContext } from '../context.js';
import { ConstantSizeSchema } from './any.js';

class SkipSchema extends ConstantSizeSchema<never> {
  clone() {
    const clone = new SkipSchema(this.size);
    return clone as this;
  }

  read(ctx: EbinContext) {
    ctx.offset += this.size;
    return undefined as never;
  }

  write(ctx: EbinContext) {
    ctx.offset += this.size;
  }
}

export function skip(size: number) {
  return new SkipSchema(size);
}
