import { bench } from 'vitest';

import * as e from 'ebin';
import { bp } from 'binparse';
// @ts-ignore
import { Parser } from 'binary-parser';
import { Parser as Encoder } from 'binary-parser-encoder';
import Destruct from 'destruct-js';
import Struct from 'structron';

// ebin
const EbinPoint = e.struct({
  x: e.uint8(),
  y: e.uint8(),
  z: e.uint8(),
});

// binparse
const BinparsePoint = bp.object('Point', {
  x: bp.u8,
  y: bp.u8,
  z: bp.u8,
});

// binary-parser
const BPPoint = new Parser().uint8('x').uint8('y').uint8('z');

// binary-parser-encoder
const BPEPoint = new Encoder().uint8('x').uint8('y').uint8('z');

// destruct-js
const destructSpec = new Destruct.Spec()
  .field('x', Destruct.UInt8)
  .field('y', Destruct.UInt8)
  .field('z', Destruct.UInt8);

// structron
const StructronPoint = new Struct()
  .addMember(Struct.TYPES.BYTE, 'x')
  .addMember(Struct.TYPES.BYTE, 'y')
  .addMember(Struct.TYPES.BYTE, 'z');

// Prepare input
const buf = Buffer.alloc(3);
buf.writeUInt8(0xff, 0);
buf.writeUInt8(0xcc, 1);
buf.writeUInt8(0xdd, 2);

const arrayBuffer = new Uint8Array(buf).buffer;

const point = { x: 0xff, y: 0xcc, z: 0xdd };

describe('parse', () => {
  bench('hand-written - Buffer', () => {
    const point = {
      x: buf.readUInt8(0),
      y: buf.readUInt8(1),
      z: buf.readUInt8(2),
    };
  });

  bench('hand-written - DataView', () => {
    const dataView = new DataView(arrayBuffer);
    const point = {
      x: dataView.getUint8(0),
      y: dataView.getUint8(1),
      z: dataView.getUint8(2),
    };
  });

  bench('ebin', () => {
    EbinPoint.fromArrayBuffer(arrayBuffer);
  });

  bench('binparse', () => {
    BinparsePoint.read(buf);
  });

  bench('binary-parser', () => {
    BPPoint.parse(buf);
  });

  bench('binary-parser-encoder', () => {
    BPEPoint.parse(buf);
  });

  bench('destruct-js', () => {
    destructSpec.read(buf);
  });

  bench('structron', () => {
    StructronPoint.read(buf, 0);
  });
});

describe('serialize', () => {
  bench('hand-written - Buffer', () => {
    const buf = Buffer.alloc(3);
    buf.writeUInt8(point.x, 0);
    buf.writeUInt8(point.y, 1);
    buf.writeUInt8(point.z, 2);
  });

  bench('hand-written - DataView', () => {
    const buf = new ArrayBuffer(3);
    const dataView = new DataView(buf);
    dataView.setUint8(0, point.x);
    dataView.setUint8(1, point.y);
    dataView.setUint8(2, point.z);
  });

  bench('ebin', () => {
    EbinPoint.toByteArray(point);
  });

  bench('binary-parser-encoder', () => {
    BPEPoint.encode(point);
  });

  bench('destruct-js', () => {
    destructSpec.write(point);
  });

  bench('structron', () => {
    StructronPoint.write(point);
  });
});
