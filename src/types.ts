import type { StructSchema } from './schemas/struct.js';

export interface BaseSchema<T = any> {
  readonly TYPE: T;
  readonly primitiveType: string | undefined;

  getByteLength(value?: T): number;

  read(reader: BaseReader, length?: number): T;
  write(writer: BaseWriter, value: T, length?: number): void;
  clone(): this;
}

export interface BaseReader {
  readInt(byteLength: 8, littleEndian?: boolean): bigint;
  readInt(byteLength: 1 | 2 | 4, littleEndian?: boolean): number;

  readUint(byteLength: 8, littleEndian?: boolean): bigint;
  readUint(byteLength: 1 | 2 | 4, littleEndian?: boolean): number;

  readFloat(byteLength: 4 | 8, littleEndian?: boolean): number;

  readBytes(byteLength: number): ArrayBuffer;
}

export interface BaseWriter {
  writeInt(byteLength: 8, value: bigint, littleEndian?: boolean): void;
  writeInt(byteLength: 1 | 2 | 4, value: number, littleEndian?: boolean): void;

  writeUint(byteLength: 8, value: bigint, littleEndian?: boolean): void;
  writeUint(byteLength: 1 | 2 | 4, value: number, littleEndian?: boolean): void;

  writeFloat(byteLength: 4 | 8, value: number, littleEndian?: boolean): void;

  writeBytes(bytes: ArrayBuffer): void;
}

export type Simplify<T> = T extends any[] | Date
  ? T
  : { [K in keyof T]: T[K] } & {};

export type If<B extends Boolean, Then, Else> = B extends true ? Then : Else;

export type Optionalize<S extends object> = OmitBy<S, undefined> &
  Partial<PickBy<S, undefined>>;

export type PickBy<T, V> = Pick<
  T,
  { [K in keyof T]: V extends Extract<T[K], V> ? K : never }[keyof T]
>;

export type ObjectSchema = Record<string, BaseSchema<any>>;

export type Infer<T extends BaseSchema<any>> = T['TYPE'];
export type InferSchema<T extends StructSchema<any>> = T['SCHEMA'];

export type ObjectType<S extends ObjectSchema> = Simplify<
  Optionalize<{ [K in keyof S]: Infer<S[K]> }>
>;

export type OmitBy<T, V> = Omit<
  T,
  { [K in keyof T]: V extends Extract<T[K], V> ? K : never }[keyof T]
>;

export type KeysMatching<T extends object, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

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
