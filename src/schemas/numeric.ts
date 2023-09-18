import { BaseReader, BaseWriter } from '../types.js';
import { AnySchema } from './any.js';

export class NumberSchema<T extends bigint | number> extends AnySchema<T> {
  protected _littleEndian: boolean | undefined = undefined;
  primitiveType = 'number';

  constructor(public byteLength: 1 | 2 | 4 | 8) {
    super();
  }

  littleEndian() {
    this._littleEndian = true;
  }

  bigEndian() {
    this._littleEndian = false;
  }
}

class IntSchema extends NumberSchema<number> {
  constructor(public byteLength: 1 | 2 | 4) {
    // TODO: Check byte length
    super(byteLength);
  }

  read(reader: BaseReader): number {
    return reader.readInt(this.byteLength, this._littleEndian);
  }

  write(writer: BaseWriter, value: number): void {
    writer.writeInt(this.byteLength, value, this._littleEndian);
  }
}

class BigIntSchema extends NumberSchema<bigint> {
  primitiveType = 'bigint';

  constructor() {
    super(8);
  }

  read(reader: BaseReader): bigint {
    return reader.readInt(8, this._littleEndian);
  }

  write(writer: BaseWriter, value: bigint): void {
    writer.writeInt(8, value, this._littleEndian);
  }
}

class UintSchema extends NumberSchema<number> {
  constructor(public byteLength: 1 | 2 | 4) {
    // TODO: Check byte length
    super(byteLength);
  }

  read(reader: BaseReader): number {
    return reader.readUint(this.byteLength, this._littleEndian);
  }

  write(writer: BaseWriter, value: number): void {
    writer.writeUint(this.byteLength, value, this._littleEndian);
  }
}

class BigUintSchema extends NumberSchema<bigint> {
  primitiveType = 'bigint';

  constructor() {
    super(8);
  }

  read(reader: BaseReader): bigint {
    return reader.readUint(8, this._littleEndian);
  }

  write(writer: BaseWriter, value: bigint): void {
    writer.writeUint(8, value, this._littleEndian);
  }
}

class FloatSchema extends NumberSchema<number> {
  constructor(public byteLength: 2 | 4 | 8) {
    // TODO: Check byte length
    super(byteLength);
  }

  read(reader: BaseReader): number {
    return reader.readFloat(this.byteLength, this._littleEndian);
  }

  write(writer: BaseWriter, value: number): void {
    writer.writeFloat(this.byteLength, value, this._littleEndian);
  }
}

export function uint8(): UintSchema {
  return new UintSchema(1);
}

export function uint16(): UintSchema {
  return new UintSchema(2);
}

export function uint32(): UintSchema {
  return new UintSchema(4);
}

export function uint64(): BigUintSchema {
  return new BigUintSchema();
}

export function int8(): IntSchema {
  return new IntSchema(1);
}

export function int16(): IntSchema {
  return new IntSchema(2);
}

export function int32(): IntSchema {
  return new IntSchema(4);
}

export function int64(): BigIntSchema {
  return new BigIntSchema();
}

export function float16(): FloatSchema {
  return new FloatSchema(2);
}

export function float32(): FloatSchema {
  return new FloatSchema(4);
}

export function float64(): FloatSchema {
  return new FloatSchema(8);
}
