interface EbinField {
  type: string;
}

interface EbinStruct {
  parse(binary: Uint8Array): any;
  serialize(data: any): Uint8Array;
}

interface NumberField extends EbinField {
  type: 'number';
  binaryType: string;
}

type Field = NumberField;

const binaryType: Record<
  string,
  { getFn: string; setFn: string; length: number }
> = {
  uint8: {
    getFn: 'getUint8',
    setFn: 'setUint8',
    length: 1,
  },
  uint16: {
    getFn: 'getUint16',
    setFn: 'setUint16',
    length: 2,
  },
  uint32: {
    getFn: 'getUint32',
    setFn: 'setUint32',
    length: 4,
  },
  uint64: {
    getFn: 'getBigUint64',
    setFn: 'setBigUint64',
    length: 8,
  },
  int8: {
    getFn: 'getInt8',
    setFn: 'setInt8',
    length: 1,
  },
  int16: {
    getFn: 'getInt16',
    setFn: 'setInt16',
    length: 2,
  },
  int32: {
    getFn: 'getInt32',
    setFn: 'setInt32',
    length: 4,
  },
  int64: {
    getFn: 'getBigInt64',
    setFn: 'setBigInt64',
    length: 8,
  },
  float: {
    getFn: 'getFloat32',
    setFn: 'setFloat32',
    length: 4,
  },
  double: {
    getFn: 'getFloat64',
    setFn: 'setFloat64',
    length: 8,
  },
};

export function struct(fields: Record<string, Field>): EbinStruct {
  return {
    parse(binary) {
      const littleEndian = false;
      const obj: any = {};
      const dataView = new DataView(binary.buffer);
      let offset = 0;

      for (const key of Object.keys(fields)) {
        switch (fields[key].type) {
          case 'number': {
            const type = binaryType[fields[key].binaryType];
            const value = (dataView as any)[type.getFn](offset, littleEndian);
            obj[key] = value;
            offset += type.length;
          }
        }
      }

      return obj;
    },
    serialize(data) {
      let length = 0;
      for (const key of Object.keys(fields)) {
        switch (fields[key].type) {
          case 'number': {
            const type = binaryType[fields[key].binaryType];
            length += type.length;
          }
        }
      }

      const array = new Uint8Array(length);
      const littleEndian = false;
      const dataView = new DataView(array.buffer);
      let offset = 0;

      for (const key of Object.keys(fields)) {
        switch (fields[key].type) {
          case 'number': {
            const type = binaryType[fields[key].binaryType];
            (dataView as any)[type.setFn](offset, data[key], littleEndian);
            offset += type.length;
          }
        }
      }

      return array;
    },
  };
}

export function uint8(): NumberField {
  return {
    type: 'number',
    binaryType: 'uint8',
  };
}

export function uint16(): NumberField {
  return {
    type: 'number',
    binaryType: 'uint16',
  };
}

export function uint32(): NumberField {
  return {
    type: 'number',
    binaryType: 'uint32',
  };
}

export function uint64(): NumberField {
  return {
    type: 'number',
    binaryType: 'uint64',
  };
}

export function int8(): NumberField {
  return {
    type: 'number',
    binaryType: 'int8',
  };
}

export function int16(): NumberField {
  return {
    type: 'number',
    binaryType: 'int16',
  };
}

export function int32(): NumberField {
  return {
    type: 'number',
    binaryType: 'int32',
  };
}

export function int64(): NumberField {
  return {
    type: 'number',
    binaryType: 'int64',
  };
}

export function float(): NumberField {
  return {
    type: 'number',
    binaryType: 'float',
  };
}

export function double(): NumberField {
  return {
    type: 'number',
    binaryType: 'double',
  };
}
