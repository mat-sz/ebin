import type { SchemaCompileOptions } from '../types.js';
import { fn } from '../utils/codegen.js';
import { createNumberLookupField, type LookupField, type NumberLookupFieldParamType } from '../utils/lookupField.js';
import { type Schema, SchemaWithEndianness } from './schema.js';

export class ArraySchema<T, TProcessed = T> extends SchemaWithEndianness<T[], TProcessed[]> {
  lookups: {
    size?: LookupField<number>;
    count?: LookupField<number>;
  } = {};

  public elementSchema: Schema<T, TProcessed>;

  get isConstantSize() {
    return !!(this.lookups.size?.isConstant || (this.lookups.count?.isConstant && this.elementSchema.isConstantSize));
  }

  constructor(elementSchema: Schema<T, TProcessed>) {
    super();

    this.elementSchema = elementSchema.clone();
    if (this.elementSchema._writePreprocess) {
      this._writePreprocess = (value: T[], parent?: unknown) => {
        const newValue: TProcessed[] = new Array(value.length);
        for (let i = 0; i < value.length; i++) {
          newValue[i] = this.elementSchema._writePreprocess!(value[i], parent);
        }
        return newValue;
      };
    }
  }

  clone() {
    const clone = new ArraySchema(this.elementSchema);
    clone.isLE = this.isLE;
    clone.lookups = this.cloneLookups();
    return clone as this;
  }

  compile(options?: SchemaCompileOptions) {
    const newOptions: SchemaCompileOptions = {
      ...options,
      isLE: this.isLE ?? options?.isLE,
    };

    this.lookups.count?.compile?.(newOptions);
    this.lookups.size?.compile?.(newOptions);
    this.elementSchema.compile(newOptions);

    const prefixSize = (this.lookups.size?.size ?? 0) + (this.lookups.count?.size ?? 0);
    if (this.lookups.size?.isConstant) {
      const size = this.lookups.size.read(undefined as any);
      this.getSize = () => size;
      this.getArraySize = this.getSize;
    } else if (this.elementSchema.isConstantSize) {
      const elementSize = this.elementSchema.getSize(undefined as any);

      if (this.lookups.count?.isConstant) {
        const count = this.lookups.count.read(undefined as any);
        const size = count * elementSize;
        this.getSize = () => count * size;
        this.getArraySize = this.getSize;
      } else {
        this.getSize = (value: TProcessed[]) => prefixSize + value.length * elementSize;
        this.getArraySize = (value: TProcessed[]) => value.length * elementSize;
      }
    } else {
      this.getSize = (value: TProcessed[]) =>
        prefixSize + value.reduce((byteLength, item) => byteLength + this.elementSchema.getSize(item), 0);
      this.getArraySize = (value: TProcessed[]) =>
        value.reduce((byteLength, item) => byteLength + this.elementSchema.getSize(item), 0);
    }

    const readBuilder = fn('ctx', 'parent');
    if (this.lookups.count) {
      readBuilder.line('const count = this.lookups.count.read(ctx, parent);');
      readBuilder.line('const items = new Array(count);');
      readBuilder.line('for (let i = 0; i < count; i++) {');
      readBuilder.line('  items[i] = this.elementSchema.read(ctx);');
      readBuilder.line('}');
    } else {
      if (this.lookups.size) {
        readBuilder.line('const size = this.lookups.size.read(ctx, parent);');
        readBuilder.line('const endOffset = ctx.offset + size;');
      } else {
        readBuilder.line('const endOffset = ctx.view.byteLength;');
      }
      readBuilder.line('const items = [];');
      readBuilder.line('while (ctx.offset < endOffset) {');
      readBuilder.line('  items.push(this.elementSchema.read(ctx));');
      readBuilder.line('}');
    }
    readBuilder.line('return items;');
    this.read = readBuilder.generate(this);

    const writeBuilder = fn('ctx', 'value');
    if (this.lookups.size?.write) {
      writeBuilder.line('this.lookups.size.write(ctx, this.getArraySize(value));');
    }
    if (this.lookups.count?.write) {
      writeBuilder.line('this.lookups.count.write(ctx, value.length);');
    }
    writeBuilder.line('for (let i = 0; i < value.length; i++) {');
    writeBuilder.line('  this.elementSchema.write(ctx, value[i]);');
    writeBuilder.line('}');
    this.write = writeBuilder.generate(this);

    if (this.lookups.size?.preWrite) {
      this._writePrepare = (value: TProcessed[], parent: unknown) => {
        this.lookups.size!.preWrite!(this.getArraySize(value), parent);
      };
    } else if (this.lookups.count?.preWrite) {
      this._writePrepare = (value: TProcessed[], parent: unknown) => {
        this.lookups.count!.preWrite!(value.length, parent);
      };
    } else {
      this._writePrepare = undefined;
    }

    super.compile();
  }

  private getArraySize(value: TProcessed[]) {
    return value.reduce((byteLength, item) => byteLength + this.elementSchema.getSize(item), 0);
  }

  count(field: NumberLookupFieldParamType): this {
    this.lookups = {
      count: createNumberLookupField(field),
    };
    return this;
  }

  size(field: NumberLookupFieldParamType): this {
    this.lookups = {
      size: createNumberLookupField(field),
    };
    return this;
  }

  greedy(): this {
    this.lookups = {};
    return this;
  }
}

export function array<T, TProcessed>(elementSchema: Schema<T, TProcessed>): ArraySchema<T, TProcessed> {
  return new ArraySchema(elementSchema);
}
