import { BaseSchema, BaseReader, BaseWriter } from '../types.js';

export class AnySchema<T = any> implements BaseSchema<T> {
  primitiveType: string | undefined = undefined;
  byteLength = 0;
  readonly TYPE!: T;

  getByteLength(): number {
    return this.byteLength ?? 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  read(reader: BaseReader): T {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  write(writer: BaseWriter, value: T): void {
    throw new Error('Not implemented');
  }
}

export class DynamicLengthSchema<T = any> extends AnySchema<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  computeByteLength(value: T): number {
    return 0;
  }

  getByteLength(value?: T | undefined): number {
    return value ? this.computeByteLength(value) : this.byteLength ?? 0;
  }
}
