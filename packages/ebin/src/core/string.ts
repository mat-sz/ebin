import { EbinContext } from '../context.js';
import { BytesSchema } from './bytes.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

class StringSchema extends BytesSchema<string> {
  read(ctx: EbinContext, parent?: any) {
    const buffer = this.readArray(ctx, parent);
    return decoder.decode(buffer);
  }

  _writePreprocess(value: string) {
    return encoder.encode(value);
  }
}

export function string(): StringSchema {
  return new StringSchema();
}
