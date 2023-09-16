import { ArrayBufferReader } from '../io/arrayBuffer/reader.js';
import { ArrayBufferWriter } from '../io/arrayBuffer/writer.js';
import {
  BaseReader,
  BaseSchema,
  BaseWriter,
  Infer,
  InferSchema,
  KeysMatching,
  ObjectSchema,
  ObjectType,
  TypedArray,
} from '../types.js';
import { AnySchema, DynamicLengthSchema } from './any.js';
import type { NumberSchema } from './numeric.js';

interface FieldSchema<TObject> {
  type: 'field';
  key: keyof TObject;
  schema: BaseSchema;
  condition?: (obj: TObject) => boolean;
}
interface ChildSchema<TObject> {
  type: 'child';
  schema: StructSchema<any>;
  condition?: (obj: TObject) => boolean;
}

export class StructSchema<
  TSchema extends ObjectSchema,
  TObject extends { [K in keyof TSchema]?: any } = ObjectType<TSchema>,
> extends DynamicLengthSchema<TObject> {
  readonly SCHEMA!: TSchema;

  private _hiddenFields: (keyof TSchema)[] = [];
  private _lengthOverride: { [K in keyof TObject]?: keyof TObject } = {};

  private _littleEndian = false;
  private _schema: (FieldSchema<TObject> | ChildSchema<TObject>)[] = [];

  constructor(fields: TSchema) {
    super();

    for (const key of Object.getOwnPropertyNames(fields)) {
      this._schema.push({ type: 'field', key, schema: fields[key] });
    }
  }

  computeByteLength(value: TObject): number {
    let length = 0;

    for (const field of this._schema) {
      if (field.condition && !field.condition(value)) {
        continue;
      }

      if (field.type === 'field') {
        length += field.schema.getByteLength(value[field.key]);
      } else {
        length += field.schema.getByteLength(value);
      }
    }

    return length;
  }

  read(reader: BaseReader): TObject {
    let obj = {} as TObject;

    for (const field of this._schema) {
      if (field.condition && !field.condition(obj)) {
        continue;
      }

      if (field.type === 'field') {
        const lengthField = this._lengthOverride[field.key];
        const length = lengthField ? obj[lengthField] : undefined;

        if (typeof length !== 'number' && typeof length !== 'undefined') {
          throw new Error(`Invalid length override type ${typeof length}.`);
        }

        obj[field.key] = field.schema.read(reader, length);
      } else {
        obj = {
          ...obj,
          ...field.schema.read(reader),
        };
      }
    }

    for (const key of this._hiddenFields) {
      delete obj[key];
    }

    return obj;
  }

  write(writer: BaseWriter, value: TObject): void {
    const lengths: { [key in keyof TObject]?: number } = {};
    for (const key of Object.keys(this._lengthOverride)) {
      const lengthField = this._lengthOverride[key];
      if (!lengthField) {
        continue;
      }

      const field = this._schema.find(
        field => field.type === 'field' && field.key === key,
      );
      if (!field) {
        continue;
      }

      const length = field.schema.getByteLength(value[key]);
      value[lengthField] = length as any;
      lengths[key as keyof TObject] = length;
    }

    for (const field of this._schema) {
      if (field.condition && !field.condition(value)) {
        continue;
      }

      if (field.type === 'field') {
        field.schema.write(writer, value[field.key], lengths[field.key]);
      } else {
        field.schema.write(writer, value);
      }
    }
  }

  fromByteArray(array: TypedArray): TObject {
    // A new Uint8Array is needed here to make node.js Buffers work without issues.
    const reader = new ArrayBufferReader(new Uint8Array(array).buffer);

    if (typeof this._littleEndian !== 'undefined') {
      reader.littleEndian = this._littleEndian;
    }

    return this.read(reader);
  }

  toByteArray(value: TObject): Uint8Array {
    const length = this.computeByteLength(value);
    const array = new Uint8Array(length);
    const writer = new ArrayBufferWriter(array.buffer);

    if (typeof this._littleEndian !== 'undefined') {
      writer.littleEndian = this._littleEndian;
    }

    this.write(writer, value);

    return array;
  }

  fromArrayBuffer(buffer: ArrayBuffer): TObject {
    return this.fromByteArray(new Uint8Array(buffer));
  }

  toArrayBuffer(value: TObject): ArrayBuffer {
    return this.toByteArray(value).buffer;
  }

  withByteLength<
    TDynamicField extends KeysMatching<TSchema, DynamicLengthSchema>,
    TLengthField extends KeysMatching<TSchema, NumberSchema<number>>,
  >(
    dynamicField: TDynamicField,
    lengthField: TLengthField,
  ): StructSchema<Omit<TSchema, TLengthField>> {
    this._lengthOverride[dynamicField] = lengthField;
    this._hiddenFields.push(lengthField);

    return this as any;
  }

  littleEndian(): this {
    this._littleEndian = true;

    return this as any;
  }

  bigEndian(): this {
    this._littleEndian = false;

    return this as any;
  }

  switch<
    TSwitchField extends KeysMatching<TSchema, AnySchema<number | string>>,
    TSwitchCases extends Record<TSwitchCaseKey, StructSchema<any, any>>,
    TSwitchCaseKey extends Infer<TSchema[TSwitchField]>,
    TSwitchSchema = {
      [K in keyof TSwitchCases]: InferSchema<TSwitchCases[K]>;
    }[keyof TSwitchCases],
    TSwitchObject = {
      [K in keyof TSwitchCases]: Omit<TObject, TSwitchField> &
        Infer<TSwitchCases[K]> & {
          [J in TSwitchField]: K;
        };
    }[keyof TSwitchCases],
  >(
    field: TSwitchField,
    cases: TSwitchCases,
  ): StructSchema<TSchema & TSwitchSchema, TObject | TSwitchObject> {
    const switchField = this._schema.find(
      f => f.type === 'field' && f.key === field,
    );
    if (!switchField) {
      throw new Error('Switch field must exist.');
    }

    for (const key of Object.keys(cases)) {
      const realKey =
        switchField.schema.primitiveType === 'number' ? parseInt(key) : key;

      this._schema.push({
        type: 'child',
        schema: cases[key as TSwitchCaseKey],
        condition: obj => obj[field] === realKey,
      });
    }
    return this as any;
  }
}

export function struct<TFields extends ObjectSchema>(
  fields: TFields,
): StructSchema<TFields> {
  return new StructSchema(fields);
}
