import { ConstantSizeSchema } from './any.js';

// TODO: Set a limit?
type BitsFields = Record<string, number>;

type BitsObject<TSchema extends BitsFields> = {
  [K in keyof TSchema]: number;
};

class BitsSchema<
  TFields extends BitsFields,
  TObject extends BitsObject<TFields> = BitsObject<TFields>,
> extends ConstantSizeSchema<TObject> {
  private fieldEntries;

  constructor(protected fields: TFields) {
    let bitSize = 0;
    for (const fieldSize of Object.values(fields)) {
      bitSize += fieldSize;
    }
    const size = Math.ceil(bitSize / 8);

    super(size);

    this.fieldEntries = Object.entries(fields) as [keyof TObject, number][];
    this.generateFn();
  }

  protected generateFn() {
    const longCount = Math.floor(this.size / 4);
    const lastSize = (this.size % 4) * 8;

    const vars = new Array(longCount).fill(32);
    if (lastSize) {
      vars.push(lastSize);
    }

    this.read = new Function(
      'ctx',
      `"use strict";
      const offset = ctx.offset;
      ${vars.map((size, i) => `const i${i} = ctx.view.getUint${size}(offset + ${i * 4});`).join('')}
      ctx.offset += ${this.size};
      ${this.generateBitsRead(vars)}
      `,
    ).bind(this);
    this.write = new Function(
      'ctx',
      'value',
      `"use strict";
      const offset = ctx.offset;
      ${this.generateBitsWrite(vars)}
      ctx.offset += ${this.size};
      `,
    ).bind(this);
  }

  private generateBitsRead(vars: number[]) {
    let out = 'return { ';

    let varIndex = 0;
    let bitOffset = 0;

    for (const [key, fieldSize] of this.fieldEntries) {
      const varSize = vars[varIndex];
      if (!varSize) {
        throw new Error("We're out of data.");
      }

      if (bitOffset + fieldSize <= varSize) {
        const mask = 2 ** fieldSize - 1;
        out += `${JSON.stringify(key)}: (i${varIndex} >> ${varSize - bitOffset - fieldSize}) & ${mask},`;
        bitOffset += fieldSize;
      } else {
        out += `${JSON.stringify(key)}: `;

        let total = 0;
        while (total < fieldSize) {
          const remainingVarSize = vars[varIndex] - bitOffset;
          const remainingFieldSize = fieldSize - total;

          if (remainingVarSize < remainingFieldSize) {
            const mask = 2 ** remainingVarSize - 1;
            out += `(i${varIndex} & ${mask}) + `;
            total += remainingVarSize;
            bitOffset = 0;
            varIndex++;
          } else {
            const mask = 2 ** remainingFieldSize - 1;
            out += `(i${varIndex} >> ${varSize - bitOffset - remainingFieldSize} & ${mask}),`;
            total += remainingFieldSize;
            bitOffset += remainingFieldSize;
          }
        }
      }

      if (bitOffset >= vars[varIndex]) {
        bitOffset -= vars[varIndex];
        varIndex++;
      }
    }

    return out + ' };';
  }

  private generateBitsWrite(vars: number[]) {
    let out = '';
    let fieldIndex = 0;
    let fieldOffset = 0;
    let offset = 0;

    for (let varIndex = 0; varIndex < vars.length; varIndex++) {
      const varSize = vars[varIndex];
      let remainingVarSize = varSize;

      let varSet = `ctx.view.setUint${varSize}(offset + ${offset}, `;

      while (remainingVarSize > 0) {
        const field = this.fieldEntries[fieldIndex];
        if (!field) {
          break;
        }

        const [key, fieldSize] = field;
        const remainingFieldSize = fieldSize - fieldOffset;
        if (remainingFieldSize <= remainingVarSize) {
          remainingVarSize -= remainingFieldSize;
          varSet += `(value[${JSON.stringify(key)}] << ${remainingVarSize})|`;
          fieldIndex++;
          fieldOffset = 0;
        } else {
          varSet += `(value[${JSON.stringify(key)}] >> ${remainingFieldSize - remainingVarSize})|`;
          fieldOffset += remainingVarSize;
          remainingVarSize = 0;
        }
      }

      if (varSet.endsWith('|')) {
        varSet = varSet.substring(0, varSet.length - 1);
      } else {
        varSet += '0';
      }

      varSet += ');';
      out += varSet;

      offset += varSize / 8;
    }

    return out;
  }

  read() {
    return {} as any;
  }

  write() {}
}

export function bits<TFields extends BitsFields>(
  fields: TFields,
): BitsSchema<TFields> {
  return new BitsSchema(fields);
}
