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

class IntField extends NumberSchema<number> {
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

class BigIntField extends NumberSchema<bigint> {
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

class UintField extends NumberSchema<number> {
  constructor(public byteLength: 1 | 2 | 4) {
    // TODO: Check byte length
    super(byteLength);
  }

  read(reader: BaseReader): number {
    return reader.readUint(this.byteLength, this._littleEndian);
  }

  write(writer: BaseWriter, value: number): void {
    writer.writeInt(this.byteLength, value, this._littleEndian);
  }
}

class BigUintField extends NumberSchema<bigint> {
  primitiveType = 'bigint';

  constructor() {
    super(8);
  }

  read(reader: BaseReader): bigint {
    return reader.readUint(8, this._littleEndian);
  }

  write(writer: BaseWriter, value: bigint): void {
    writer.writeInt(8, value, this._littleEndian);
  }
}

class FloatField extends NumberSchema<number> {
  constructor(public byteLength: 4 | 8) {
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

export function uint8(): UintField {
  return new UintField(1);
}

export function uint16(): UintField {
  return new UintField(2);
}

export function uint32(): UintField {
  return new UintField(4);
}

export function uint64(): BigUintField {
  return new BigUintField();
}

export function int8(): IntField {
  return new IntField(1);
}

export function int16(): IntField {
  return new IntField(2);
}

export function int32(): IntField {
  return new IntField(4);
}

export function int64(): BigIntField {
  return new BigIntField();
}

export function float(): FloatField {
  return new FloatField(4);
}

export function double(): FloatField {
  return new FloatField(8);
}
