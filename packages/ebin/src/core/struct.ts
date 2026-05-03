import type { BaseSchema, ExcludeMatchingProperties, ISchemaCompileOptions, SchemaValue } from '../types.js';
import { fn } from '../utils/codegen.js';
import { SchemaWithEndianness } from './any.js';

type StructFields = Record<string, BaseSchema<any>>;

type StructObject<S extends StructFields> = Partial<
  ExcludeMatchingProperties<
    {
      [K in keyof S]: SchemaValue<S[K]>;
    },
    never
  >
>;

class StructSchema<
  TFields extends StructFields,
  TObject = StructObject<TFields>,
> extends SchemaWithEndianness<TObject> {
  isConstantSize = false;
  protected fields: TFields;

  constructor(fields: TFields) {
    super();

    this.fields = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.clone()])) as TFields;
  }

  clone() {
    const clone = new StructSchema(this.fields);
    clone._littleEndian = this._littleEndian;
    return clone as this;
  }

  compile(options?: ISchemaCompileOptions) {
    const fieldEntries = Object.entries(this.fields) as [keyof TObject, BaseSchema][];
    for (const [_, field] of fieldEntries) {
      field.compile?.({
        ...options,
        littleEndian: this._littleEndian ?? options?.littleEndian,
      });
    }

    const hasParentDependencies = fieldEntries.some(
      ([_, field]) => field.lookups && Object.values(field.lookups).some((lookup) => lookup?.parentField),
    );
    const constantSizeFields = fieldEntries.filter(([_, field]) => field.isConstantSize);
    const dynamicSizeFields = fieldEntries.filter(([_, field]) => !field.isConstantSize);
    const dynamicSizeFieldKeys = dynamicSizeFields.map(([key]) => JSON.stringify(key));
    this.isConstantSize = dynamicSizeFields.length === 0;
    let constantSize = 0;
    for (const [_, field] of constantSizeFields) {
      constantSize += field.getSize();
    }

    if (this.isConstantSize) {
      this.getSize = new Function(
        `"use strict";
        return ${constantSize};
        `,
      ).bind(this);
    } else {
      this.getSize = new Function(
        'value',
        `"use strict";
        return ${constantSize} + ${dynamicSizeFieldKeys.map((key) => `this.fields[${key}].getSize(value[${key}], value)`).join(' + ')};
        `,
      ).bind(this);
    }

    const fields = fieldEntries.map(([key, field]) => [JSON.stringify(key), field] as const);

    const readBuilder = fn('ctx');

    if (hasParentDependencies) {
      readBuilder.line('var obj = {};');
      for (const [key] of fields) {
        readBuilder.line(`obj[${key}] = this.fields[${key}].read(ctx, obj);`);
      }
    } else {
      readBuilder.line('var obj = {');
      for (const [key] of fields) {
        readBuilder.line(`${key}: this.fields[${key}].read(ctx),`);
      }
      readBuilder.line('};');
    }

    readBuilder.line('return obj;');

    this.read = readBuilder.generate(this);

    const writeBuilder = fn('ctx', 'value');

    for (const [key, field] of fields) {
      if (!field._writePrepare) {
        continue;
      }

      writeBuilder.line(`this.fields[${key}]._writePrepare(value[${key}], value);`);
    }

    for (const [key, field] of fields) {
      writeBuilder.line(
        `this.fields[${key}].write(ctx, value[${key}]${typeof field.defaultValue !== 'undefined' ? ` ?? this.fields[${key}].defaultValue` : ''}, value);`,
      );
    }

    this.write = writeBuilder.generate(this);

    const preprocessFields = fields.filter(([_, field]) => !!field._writePreprocess);

    if (preprocessFields.length > 0) {
      const writePreprocessBuilder = fn('value');
      writePreprocessBuilder.line('value = {...value};');
      for (const [key] of preprocessFields) {
        writePreprocessBuilder.line(`value[${key}] = this.fields[${key}]._writePreprocess(value[${key}], value);`);
      }
      writePreprocessBuilder.line('return value;');
      this._writePreprocess = writePreprocessBuilder.generate(this);
    } else {
      this._writePreprocess = undefined;
    }

    super.compile();
  }
}

export function struct<TFields extends StructFields>(fields: TFields): StructSchema<TFields> {
  return new StructSchema(fields);
}
