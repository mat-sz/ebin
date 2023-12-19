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
  PartialBy,
  ReadContext,
  TypedArray,
} from '../types.js';
import { AnySchema, DynamicLengthSchema } from './any.js';

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

type StructObject<TSchema extends ObjectSchema> = {
  [K in keyof TSchema]?: any;
};
type SwitchCases<TSwitchCaseKey extends keyof any> = Record<
  TSwitchCaseKey,
  StructSchema<any, any>
>;
type SwitchSchema<TSwitchCases extends SwitchCases<any>> = {
  [K in keyof TSwitchCases]: InferSchema<TSwitchCases[K]>;
}[keyof TSwitchCases];
type SwitchObject<
  TObject extends StructObject<any>,
  TSwitchCases extends SwitchCases<any>,
  TSwitchField extends keyof any,
  TObjectWithoutCaseKey = Omit<TObject, TSwitchField>,
> = {
  [K in keyof TSwitchCases]: TObjectWithoutCaseKey &
    Infer<TSwitchCases[K]> & {
      [J in TSwitchField]: K;
    };
}[keyof TSwitchCases];
type SwitchStructSchema<
  TSchema extends ObjectSchema,
  TObject extends StructObject<TSchema>,
  TSwitchCases extends SwitchCases<any>,
  TSwitchField extends keyof any,
> = StructSchema<
  TSchema & SwitchSchema<TSwitchCases>,
  TObject | SwitchObject<TObject, TSwitchCases, TSwitchField>
>;

export class StructSchema<
  TSchema extends ObjectSchema,
  TObject extends StructObject<TSchema> = ObjectType<TSchema>,
> extends DynamicLengthSchema<TObject> {
  readonly SCHEMA!: TSchema;

  private _propertyWriteValueFn: {
    [K in keyof TObject]?: (value: TObject) => keyof TObject;
  } = {};

  private _propertyReadContextFn: {
    [K in keyof TObject]?: (value: TObject) => ReadContext;
  } = {};

  private _littleEndian = false;
  private _schema: (FieldSchema<TObject> | ChildSchema<TObject>)[] = [];

  constructor(fields: TSchema) {
    super();

    for (const key of Object.getOwnPropertyNames(fields)) {
      this._schema.push({ type: 'field', key, schema: fields[key] });
    }
  }

  get isConstantSize() {
    for (const field of this._schema) {
      if (field.condition) {
        return false;
      }

      if (!field.schema.isConstantSize) {
        return false;
      }
    }

    return true;
  }

  getByteLength(value: TObject): number {
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

  read(reader: BaseReader): Required<TObject> {
    const littleEndian = reader.littleEndian;
    if (typeof this._littleEndian !== 'undefined') {
      reader.littleEndian = this._littleEndian;
    }

    let obj = {} as Required<TObject>;

    for (const field of this._schema) {
      if (field.condition && !field.condition(obj)) {
        continue;
      }

      if (field.type === 'field') {
        obj[field.key] = field.schema.read(
          reader,
          this._propertyReadContextFn[field.key]?.(obj),
        );
      } else {
        obj = {
          ...obj,
          ...field.schema.read(reader),
        };
      }
    }

    // Since child structs can override that, we need to make sure to reset it back.
    reader.littleEndian = littleEndian;

    return obj;
  }

  write(writer: BaseWriter, value: TObject): void {
    const littleEndian = writer.littleEndian;
    if (typeof this._littleEndian !== 'undefined') {
      writer.littleEndian = this._littleEndian;
    }

    for (const key of Object.keys(this._propertyWriteValueFn)) {
      value[key as keyof TObject] = this._propertyWriteValueFn[key]!(
        value,
      ) as any;
    }

    for (const field of this._schema) {
      if (field.condition && !field.condition(value)) {
        continue;
      }

      if (field.type === 'field') {
        field.schema.write(writer, value[field.key]);
      } else {
        field.schema.write(writer, value);
      }
    }

    // Since child structs can override that, we need to make sure to reset it back.
    writer.littleEndian = littleEndian;
  }

  fromByteArray(array: TypedArray): Required<TObject> {
    const reader = new ArrayBufferReader(
      array.buffer.slice(array.byteOffset, array.byteOffset + array.byteLength),
    );
    return this.read(reader);
  }

  toByteArray(value: TObject): Uint8Array {
    const length = this.getByteLength(value);
    const array = new Uint8Array(length);
    const writer = new ArrayBufferWriter(array.buffer);

    this.write(writer, value);
    return array;
  }

  fromArrayBuffer(buffer: ArrayBuffer): Required<TObject> {
    return this.fromByteArray(new Uint8Array(buffer));
  }

  toArrayBuffer(value: TObject): ArrayBuffer {
    return this.toByteArray(value).buffer;
  }

  withByteLength<
    TDynamicField extends KeysMatching<TSchema, DynamicLengthSchema>,
    TLengthField extends KeysMatching<TSchema, AnySchema<number>>,
  >(
    dynamicField: TDynamicField,
    lengthField: TLengthField,
  ): StructSchema<
    PartialBy<TSchema, TLengthField>,
    PartialBy<TObject, TLengthField>
  > {
    const dynamicSchema = this._schema.find(
      schema => schema.type === 'field' && schema.key === dynamicField,
    );
    if (!dynamicSchema) {
      throw new Error(
        `Unable to set withByteLength on field '${String(dynamicField)}'`,
      );
    }

    this._propertyWriteValueFn[lengthField] = value =>
      dynamicSchema.schema.getByteLength(value[dynamicField]) as any;
    this._propertyReadContextFn[dynamicField] = value => ({
      byteLength: value[lengthField],
    });

    return this as any;
  }

  withCount<
    TDynamicField extends KeysMatching<TSchema, DynamicLengthSchema>,
    TLengthField extends KeysMatching<TSchema, AnySchema<number>>,
  >(
    dynamicField: TDynamicField,
    lengthField: TLengthField,
  ): StructSchema<
    PartialBy<TSchema, TLengthField>,
    PartialBy<TObject, TLengthField>
  > {
    const dynamicSchema = this._schema.find(
      schema => schema.type === 'field' && schema.key === dynamicField,
    );
    if (!dynamicSchema) {
      throw new Error(
        `Unable to set withByteLength on field '${String(dynamicField)}'`,
      );
    }

    this._propertyWriteValueFn[lengthField] = value =>
      dynamicSchema.schema.getCount(value[dynamicField]) as any;
    this._propertyReadContextFn[dynamicField] = value => ({
      count: value[lengthField],
    });

    return this as any;
  }

  littleEndian(): this {
    this._littleEndian = true;

    return this;
  }

  bigEndian(): this {
    this._littleEndian = false;

    return this;
  }

  switch<
    TSwitchField extends KeysMatching<TSchema, BaseSchema<number | string>>,
    TSwitchCases extends SwitchCases<TSwitchCaseKey>,
    TSwitchCaseKey extends Infer<TSchema[TSwitchField]>,
  >(
    field: TSwitchField,
    cases: TSwitchCases,
  ): SwitchStructSchema<TSchema, TObject, TSwitchCases, TSwitchField> {
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
