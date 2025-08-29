import type { EbinContext } from './context.js';

export interface BaseSchema<T = any> {
  readonly TYPE: T;
  readonly isConstantSize: boolean;
  readonly dependsOnParent: boolean;
  defaultValue?: T;

  getSize(value?: T): number;

  read(ctx: EbinContext, parent?: any): T;
  write(ctx: EbinContext, value: T): void;
  preWrite?(value: T, parent: any): void;
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

export type StructFields = Record<string, BaseSchema<any>>;

export type Infer<T extends BaseSchema<any>> = T['TYPE'];

export type Simplify<T> = T extends any[] | Date
  ? T
  : { [K in keyof T]: T[K] } & {};

export type ObjectType<S extends StructFields> = Simplify<{
  [K in keyof S]?: Infer<S[K]>;
}>;
