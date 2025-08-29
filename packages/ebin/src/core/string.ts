import { EbinContext } from '../context.js';
import { BaseBytesSchema } from './bytes.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

class StringSchema extends BaseBytesSchema<string> {
  private lastString?: string;
  private lastBytes?: ArrayBufferLike;

  private encodeString(str: string) {
    // TODO: Better optimization.
    if (this.lastString === str) {
      return this.lastBytes!;
    }

    this.lastString = str;
    this.lastBytes = encoder.encode(str).buffer;
    return this.lastBytes;
  }

  getSize(value: string) {
    return this.getBufferSize(this.encodeString(value));
  }

  read(ctx: EbinContext, parent?: any) {
    const buffer = this.readBuffer(ctx, parent);
    return decoder.decode(buffer);
  }

  write(ctx: EbinContext, value: string) {
    this.writeBuffer(ctx, this.encodeString(value));
  }
}

export function string(): StringSchema {
  return new StringSchema();
}
