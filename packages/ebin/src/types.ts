export interface SchemaCompileOptions {
  isLE?: boolean;
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

export type ExcludeMatchingProperties<T, V> = Pick<T, { [K in keyof T]-?: T[K] extends V ? never : K }[keyof T]>;

export interface TextEncoding {
  getSize(input: string): number;
  decode(input: Uint8Array): string;
  encode(input: string, output: Uint8Array): void;
}
