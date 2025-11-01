import {
  BaseSchema,
  ExcludeMatchingProperties,
  SchemaValue,
} from '../types.js';
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
  private fieldEntries;

  constructor(protected fields: TFields) {
    super();
    this.fieldEntries = Object.entries(fields) as [keyof TObject, BaseSchema][];

    this.generateFn();
  }

  protected generateFn() {
    const hasParentDependencies = this.fieldEntries.some(
      ([_, field]) =>
        field.lookups &&
        Object.values(field.lookups).some(lookup => lookup?.parentField),
    );
    const hasEndianness = typeof this._littleEndian !== 'undefined';
    const constantSizeFields = this.fieldEntries.filter(
      ([_, field]) => field.isConstantSize,
    );
    const dynamicSizeFields = this.fieldEntries.filter(
      ([_, field]) => !field.isConstantSize,
    );
    const dynamicSizeFieldKeys = dynamicSizeFields.map(([key]) =>
      JSON.stringify(key),
    );
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
        return ${constantSize} + ${dynamicSizeFieldKeys.map(key => `this.fields[${key}].getSize(value[${key}], value)`).join(' + ')};
        `,
      ).bind(this);
    }

    const fields = this.fieldEntries.map(
      ([key, field]) => [JSON.stringify(key), field] as const,
    );

    const readBuilder = fn('ctx');
    if (hasEndianness) {
      readBuilder.line(`var littleEndian = ctx.littleEndian;`);
      readBuilder.line(`ctx.littleEndian = ${this._littleEndian};`);
    }

    if (hasParentDependencies) {
      readBuilder.line(`var obj = {};`);
      for (const [key] of fields) {
        readBuilder.line(`obj[${key}] = this.fields[${key}].read(ctx, obj);`);
      }
    } else {
      readBuilder.line(`var obj = {`);
      for (const [key] of fields) {
        readBuilder.line(`${key}: this.fields[${key}].read(ctx),`);
      }
      readBuilder.line(`};`);
    }

    if (hasEndianness) {
      readBuilder.line(`ctx.littleEndian = littleEndian;`);
    }

    readBuilder.line(`return obj;`);

    this.read = readBuilder.generate(this);

    const writeBuilder = fn('ctx', 'value');
    if (hasEndianness) {
      writeBuilder.line(`var littleEndian = ctx.littleEndian;`);
      writeBuilder.line(`ctx.littleEndian = ${this._littleEndian};`);
    }

    for (const [key, field] of fields) {
      if (!field._writePrepare) {
        continue;
      }

      writeBuilder.line(
        `this.fields[${key}]._writePrepare(value[${key}], value);`,
      );
    }

    for (const [key, field] of fields) {
      writeBuilder.line(
        `this.fields[${key}].write(ctx, value[${key}]${typeof field.defaultValue !== 'undefined' ? ` ?? this.fields[${key}].defaultValue` : ''}, value);`,
      );
    }

    if (hasEndianness) {
      writeBuilder.line(`ctx.littleEndian = littleEndian;`);
    }

    this.write = writeBuilder.generate(this);

    const preprocessFields = fields.filter(
      ([_, field]) => !!field._writePreprocess,
    );

    if (preprocessFields.length > 0) {
      const writePreprocessBuilder = fn('value');
      writePreprocessBuilder.line(`value = {...value};`);
      for (const [key] of preprocessFields) {
        writePreprocessBuilder.line(
          `value[${key}] = this.fields[${key}]._writePreprocess(value[${key}], value);`,
        );
      }
      writePreprocessBuilder.line(`return value;`);
      this._writePreprocess = writePreprocessBuilder.generate(this);
    } else {
      this._writePreprocess = undefined;
    }
  }

  getSize() {
    return 0;
  }

  read(): Required<TObject> {
    return {} as any;
  }

  write() {}
}

export function struct<TFields extends StructFields>(
  fields: TFields,
): StructSchema<TFields> {
  return new StructSchema(fields);
}
