import { ArrayBufferReader } from '../io/arrayBuffer/reader.js';
import { ArrayBufferWriter } from '../io/arrayBuffer/writer.js';
import {
  BaseReader,
  BaseWriter,
  KeysMatching,
  ObjectSchema,
  ObjectType,
  TypedArray,
} from '../types.js';
import { DynamicLengthSchema } from './any.js';
import type { NumberSchema } from './numeric.js';

export class StructSchema<
  TSchema extends ObjectSchema,
  TObject extends { [K in keyof TSchema]?: any } = ObjectType<TSchema>,
> extends DynamicLengthSchema<TObject> {
  readonly SCHEMA!: TSchema;

  private _hiddenFields: (keyof TSchema)[] = [];
  private _lengthOverride: { [K in keyof TObject]?: keyof TObject } = {};

  private _littleEndian = false;

  constructor(private fields: TSchema) {
    super();
  }

  computeLength(value: TObject): number {
    let length = 0;

    const keys = Object.keys(this.fields) as (keyof TSchema)[];
    for (const key of keys) {
      const schema = this.fields[key];
      // TODO .getByteLength
      length += schema.getByteLength(value[key]);
    }

    return length;
  }

  read(reader: BaseReader): TObject {
    const obj = {} as TObject;

    const keys = Object.keys(this.fields) as (keyof TSchema)[];
    for (const key of keys) {
      const lengthField = this._lengthOverride[key];
      const length = lengthField ? obj[lengthField] : undefined;

      if (typeof length !== 'number' && typeof length !== 'undefined') {
        throw new Error(`Invalid length override type ${typeof length}.`);
      }

      obj[key] = this.fields[key].read(reader, length);
    }

    for (const key of this._hiddenFields) {
      delete obj[key];
    }

    return obj;
  }

  write(writer: BaseWriter, value: TObject): void {
    const lengths: Record<string, number> = {};
    for (const key of Object.keys(this._lengthOverride)) {
      const lengthField = this._lengthOverride[key];
      if (!lengthField) {
        continue;
      }

      const schema = this.fields[key];

      const length = schema.getByteLength(value[key]);
      value[lengthField] = length as any;
      lengths[key] = length;
    }

    for (const key of Object.keys(this.fields)) {
      this.fields[key].write(writer, value[key], lengths[key]);
    }
  }

  fromByteArray(array: TypedArray): TObject {
    const reader = new ArrayBufferReader(array.buffer);
    reader.littleEndian = this._littleEndian;
    return this.read(reader);
  }

  toByteArray(value: TObject): Uint8Array {
    const length = this.computeLength(value);

    const array = new Uint8Array(length);
    const writer = new ArrayBufferWriter(array.buffer);
    writer.littleEndian = this._littleEndian;
    this.write(writer, value);

    return array;
  }

  fromArrayBuffer(buffer: ArrayBuffer): TObject {
    const reader = new ArrayBufferReader(buffer);
    reader.littleEndian = this._littleEndian;
    return this.read(reader);
  }

  toArrayBuffer(value: TObject): ArrayBuffer {
    return this.toByteArray(value).buffer;
  }

  withLength<
    TDynamicField extends KeysMatching<TSchema, DynamicLengthSchema>,
    TLengthField extends KeysMatching<TSchema, NumberSchema<number>>,
  >(
    stringField: TDynamicField,
    lengthField: TLengthField,
  ): StructSchema<Omit<TSchema, TLengthField>> {
    this._lengthOverride[stringField] = lengthField;
    this._hiddenFields.push(lengthField);

    return this as any;
  }

  littleEndian() {
    this._littleEndian = true;
  }

  bigEndian() {
    this._littleEndian = false;
  }
}

export function struct<TFields extends ObjectSchema>(
  fields: TFields,
): StructSchema<TFields> {
  return new StructSchema(fields);
}
