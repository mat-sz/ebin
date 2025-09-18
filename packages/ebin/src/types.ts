import type { EbinContext } from './context.js';

export interface LookupField<T> {
  readonly size: number;
  readonly isConstant: boolean;
  readonly parentField?: string;

  read(ctx: EbinContext, parent?: any): T;
  write?: (ctx: EbinContext, value: T, parent?: any) => void;
  preWrite?: (value: T, parent: any) => void;
}

export interface BaseSchema<T = any, TProcessed = T> {
  readonly TYPE: T;
  readonly isConstantSize: boolean;
  readonly lookups?: Record<string, LookupField<any> | undefined>;
  defaultValue?: T;

  getSize(value?: TProcessed, parent?: any): number;

  read(ctx: EbinContext, parent?: any): T;
  write(ctx: EbinContext, value: TProcessed, parent?: any): void;

  _writePreprocess?(value: T, parent?: any): TProcessed;
  _writePrepare?(value: TProcessed, parent?: any): void;
}

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export type SchemaValue<T extends BaseSchema<any>> = T['TYPE'];

export type ExcludeMatchingProperties<T, V> = Pick<
  T,
  { [K in keyof T]-?: T[K] extends V ? never : K }[keyof T]
>;
