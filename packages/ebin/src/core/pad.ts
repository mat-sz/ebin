import { EbinContext } from '../context.js';
import { BaseSchema } from '../types.js';
import { AnySchema } from './any.js';

class PadSchema<T> extends AnySchema<T> {
  constructor(
    private itemType: BaseSchema<T>,
    private blockSize: number,
  ) {
    super();
  }

  get isConstantSize() {
    return this.itemType.isConstantSize;
  }

  get lookups() {
    return this.itemType.lookups;
  }

  read(ctx: EbinContext, parent?: any) {
    const startOffset = ctx.offset;
    const output = this.itemType.read(ctx, parent);
    const size = ctx.offset - startOffset;
    const padding = this.blockSize - (size % this.blockSize);
    ctx.offset += padding;
    return output;
  }

  write(ctx: EbinContext, value: T, parent?: any) {
    const startOffset = ctx.offset;
    const output = this.itemType.write(ctx, value, parent);
    const size = ctx.offset - startOffset;
    const padding = this.blockSize - (size % this.blockSize);
    ctx.offset += padding;
    return output;
  }

  getSize(value: T, parent?: any) {
    const size = this.itemType.getSize(value, parent);
    const padding = this.blockSize - (size % this.blockSize);
    return size + padding;
  }
}

export function pad<T>(
  itemType: BaseSchema<T>,
  blockSize: number,
): PadSchema<T> {
  return new PadSchema(itemType, blockSize);
}
