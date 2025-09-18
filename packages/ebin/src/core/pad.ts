import { EbinContext } from '../context.js';
import { BaseSchema } from '../types.js';
import { AnySchema } from './any.js';

class PadSchema<T, TProcessed = T> extends AnySchema<T, TProcessed> {
  constructor(
    private itemType: BaseSchema<T, TProcessed>,
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

  write(ctx: EbinContext, value: TProcessed, parent?: any) {
    const startOffset = ctx.offset;
    const output = this.itemType.write(ctx, value, parent);
    const size = ctx.offset - startOffset;
    const padding = this.blockSize - (size % this.blockSize);
    ctx.offset += padding;
    return output;
  }

  getSize(value: TProcessed, parent?: any) {
    const size = this.itemType.getSize(value, parent);
    const padding = this.blockSize - (size % this.blockSize);
    return size + padding;
  }

  _writePrepare(value: TProcessed, parent: any) {
    this.itemType._writePrepare?.(value, parent);
  }

  _writePreprocess(value: T, parent?: any): any {
    return this.itemType._writePreprocess
      ? this.itemType._writePreprocess(value, parent)
      : value;
  }
}

export function pad<T>(
  itemType: BaseSchema<T>,
  blockSize: number,
): PadSchema<T> {
  return new PadSchema(itemType, blockSize);
}
