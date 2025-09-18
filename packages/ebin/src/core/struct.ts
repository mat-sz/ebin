import {
  BaseSchema,
  ExcludeMatchingProperties,
  SchemaValue,
} from '../types.js';
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

    this.read = new Function(
      'ctx',
      `"use strict";
      ${
        hasEndianness
          ? `
          const littleEndian = ctx.littleEndian;
          ctx.littleEndian = ${this._littleEndian};
          `
          : ''
      }
      ${
        hasParentDependencies
          ? `
          const obj = {};
          ${fields.map(([key]) => `obj[${key}] = this.fields[${key}].read(ctx, obj);`).join('')}
          `
          : `
          const obj = { ${fields.map(([key]) => `${key}: this.fields[${key}].read(ctx)`).join(',')} };
          `
      }
      ${hasEndianness ? `ctx.littleEndian = littleEndian;` : ''}
      return obj;
      `,
    ).bind(this);

    this.write = new Function(
      'ctx',
      'value',
      `"use strict";
          ${
            hasEndianness
              ? `
              const littleEndian = ctx.littleEndian;
              ctx.littleEndian = ${this._littleEndian};
              `
              : ''
          }
          ${fields
            .filter(([_, field]) => !!field._writePrepare)
            .map(
              ([key]) =>
                `this.fields[${key}]._writePrepare(value[${key}], value);`,
            )
            .join('')}
          ${fields.map(([key, field]) => `this.fields[${key}].write(ctx, value[${key}]${typeof field.defaultValue !== 'undefined' ? ` ?? this.fields[${key}].defaultValue` : ''}, value);`).join('')}
          ${hasEndianness ? `ctx.littleEndian = littleEndian;` : ''}
          `,
    ).bind(this);

    const preprocessFields = fields.filter(
      ([_, field]) => !!field._writePreprocess,
    );

    if (preprocessFields.length > 0) {
      this._writePreprocess = new Function(
        'value',
        `"use strict";
        value = {...value};
        ${preprocessFields
          .map(
            ([key]) =>
              `value[${key}] = this.fields[${key}]._writePreprocess(value[${key}], value);`,
          )
          .join('')}
        return value;
        `,
      ).bind(this);
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
