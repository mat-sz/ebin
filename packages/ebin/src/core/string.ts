import type { EbinContext } from '../context.js';
import type { LookupField } from '../types.js';
import { createNumberLookupField, type NumberLookupFieldParamType } from '../utils/lookupField.js';
import { textEncodings } from '../utils/textEncoding/index.js';
import { AnySchema } from './any.js';

const ENCODING = 'utf8';

class StringSchema extends AnySchema<string> {
  isConstantSize = false;
  lookups: {
    size?: LookupField<number>;
  } = {};
  private _encoding = textEncodings[ENCODING];

  getSize(value: string) {
    const sizeLookup = this.lookups.size;
    if (!sizeLookup?.size) {
      return this._encoding.getSize(value);
    }

    if (sizeLookup.isConstant) {
      // TODO: Fix.
      return sizeLookup.read(undefined as any);
    }

    return sizeLookup.size + this._encoding.getSize(value);
  }

  size(field: NumberLookupFieldParamType): this {
    const sizeLookup = createNumberLookupField(field);
    this.lookups.size = sizeLookup;
    this.isConstantSize = sizeLookup.isConstant;
    return this;
  }

  read(ctx: EbinContext, parent?: any) {
    const size = this.lookups.size?.read(ctx, parent) ?? ctx.view.byteLength - ctx.offset;

    const buffer = ctx.bytes(size);
    return this._encoding.decode(buffer);
  }

  write(ctx: EbinContext, value: string): void {
    const byteLength = this._encoding.getSize(value);
    this.lookups.size?.write?.(ctx, byteLength);

    this._encoding.encode(value, ctx.bytes(byteLength));
  }

  _writePrepare(value: string, parent: any) {
    this.lookups.size?.preWrite?.(this._encoding.getSize(value), parent);
  }
}

export function string(): StringSchema {
  return new StringSchema();
}
