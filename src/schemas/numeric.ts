import { BaseReader, BaseWriter } from '../types.js';
import { AnySchema } from './any.js';

class NumberSchema<T extends bigint | number> extends AnySchema<T> {
  protected _littleEndian: boolean | undefined = undefined;
  primitiveType = 'number';

  constructor(protected _byteLength: 1 | 2 | 4 | 8) {
    super();
  }

  getByteLength(): number {
    return this._byteLength;
  }

  littleEndian(): this {
    this._littleEndian = true;
    return this;
  }

  bigEndian(): this {
    this._littleEndian = false;
    return this;
  }
}

class IntSchema extends NumberSchema<number> {
  constructor(protected _byteLength: 1 | 2 | 4) {
    // TODO: Check byte length
    super(_byteLength);
  }

  read(reader: BaseReader): number {
    return reader.readInt(this._byteLength, this._littleEndian);
  }

  write(writer: BaseWriter, value: number): void {
    writer.writeInt(this._byteLength, value, this._littleEndian);
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
  constructor(protected _byteLength: 1 | 2 | 4) {
    // TODO: Check byte length
    super(_byteLength);
  }

  read(reader: BaseReader): number {
    return reader.readUint(this._byteLength, this._littleEndian);
  }

  write(writer: BaseWriter, value: number): void {
    writer.writeUint(this._byteLength, value, this._littleEndian);
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
  constructor(protected _byteLength: 2 | 4 | 8) {
    // TODO: Check byte length
    super(_byteLength);
  }

  read(reader: BaseReader): number {
    return reader.readFloat(this._byteLength, this._littleEndian);
  }

  write(writer: BaseWriter, value: number): void {
    writer.writeFloat(this._byteLength, value, this._littleEndian);
  }
}

export function uint8(): Omit<UintSchema, 'bigEndian' | 'littleEndian'> {
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

export function int8(): Omit<IntSchema, 'bigEndian' | 'littleEndian'> {
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
