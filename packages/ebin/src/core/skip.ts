import { EbinContext } from '../context.js';
import { ConstantSizeSchema } from './any.js';

class SkipSchema extends ConstantSizeSchema<undefined> {
  read(ctx: EbinContext) {
    ctx.offset += this.size;
    return undefined;
  }

  write(ctx: EbinContext) {
    ctx.offset += this.size;
  }
}

export function skip(size: number) {
  return new SkipSchema(size);
}
