import { bench } from 'vitest';

import * as e from 'ebin';
import { bp } from 'binparse';
// @ts-ignore
import { Parser } from 'binary-parser';
import { Parser as Encoder } from 'binary-parser-encoder';
import Destruct from 'destruct-js';
import Struct from 'structron';

// ebin
const EbinPoints = e
  .struct({
    length: e.uint32(),
    points: e
      .array(
        e.struct({
          x: e.uint16(),
          y: e.uint16(),
          z: e.uint16(),
        }),
      )
      .count('length'),
  })
  .littleEndian();

// binparse
const BinparsePoint = bp.object('Point', {
  x: bp.lu16,
  y: bp.lu16,
  z: bp.lu16,
});

const BinparsePoints = bp.object('SimpleObject', {
  length: bp.lu32,
  points: bp.array('Points', BinparsePoint, 'length'),
});

// binary-parser
const BPPoints = new Parser().uint32le('len').array('points', {
  length: 'len',
  type: new Parser().uint16le('x').uint16le('y').uint16le('z'),
});

// binary-parser-encoder
const BPEPoints = new Encoder().uint32le('len').array('points', {
  length: 'len',
  type: new Encoder().uint16le('x').uint16le('y').uint16le('z'),
});

// destruct-js
const destructSpec = new Destruct.Spec({ mode: Destruct.Mode.LE });
destructSpec
  .field('len', Destruct.UInt32)
  .loop(
    'points',
    r => r.len,
    new Destruct.Spec({ mode: Destruct.Mode.LE })
      .field('x', Destruct.UInt16)
      .field('y', Destruct.UInt16)
      .field('z', Destruct.UInt16),
  );

// structron
const StructronPoints = new Struct()
  .addMember(Struct.TYPES.UINT_LE, 'len')
  .addArray(
    new Struct()
      .addMember(Struct.TYPES.USHORT_LE, 'x')
      .addMember(Struct.TYPES.USHORT_LE, 'y')
      .addMember(Struct.TYPES.USHORT_LE, 'z'),
    'points',
    0,
    'len',
  );

// Prepare input
const n = 1000;
const buf = Buffer.alloc(4 + n * 2 * 3);

buf.writeUInt32LE(n, 0);
for (let i = 0; i < n; i++) {
  buf.writeUInt16LE(123, i * 6 + 0 + 4);
  buf.writeUInt16LE(456, i * 6 + 2 + 4);
  buf.writeUInt16LE(789, i * 6 + 4 + 4);
}

const arrayBuffer = new Uint8Array(buf).buffer;

const points: { x: number; y: number; z: number }[] = [];

for (let i = 0; i < n; i++) {
  points.push({ x: 123, y: 456, z: 789 });
}

describe('parse', () => {
  bench('hand-written - Buffer', () => {
    const n = buf.readUInt32LE(0);
    const points = new Array(n);
    for (let i = 0; i < n; i++) {
      points[i] = {
        x: buf.readUInt16LE(i * 6 + 0 + 4),
        y: buf.readUInt16LE(i * 6 + 2 + 4),
        z: buf.readUInt16LE(i * 6 + 4 + 4),
      };
    }
  });

  bench('hand-written - DataView', () => {
    const dataView = new DataView(arrayBuffer);
    const n = dataView.getUint32(0, true);
    const points = new Array(n);
    for (let i = 0; i < n; i++) {
      points[i] = {
        x: dataView.getUint16(i * 6 + 0 + 4, true),
        y: dataView.getUint16(i * 6 + 2 + 4, true),
        z: dataView.getUint16(i * 6 + 4 + 4, true),
      };
    }
  });

  bench('ebin', () => {
    EbinPoints.fromArrayBuffer(arrayBuffer);
  });

  bench('binparse', () => {
    BinparsePoints.read(buf);
  });

  bench('binary-parser', () => {
    BPPoints.parse(buf);
  });

  bench('binary-parser-encoder', () => {
    BPEPoints.parse(buf);
  });

  bench('destruct-js', () => {
    destructSpec.read(buf);
  });

  bench('structron', () => {
    StructronPoints.read(buf, 0);
  });
});

describe('serialize', () => {
  bench('hand-written - Buffer', () => {
    const buf = Buffer.alloc(4 + n * 2 * 3);
    buf.writeUInt32LE(points.length, 0);
    for (let i = 0; i < points.length; i++) {
      buf.writeUInt16LE(points[i].x, i * 6 + 0 + 4);
      buf.writeUInt16LE(points[i].y, i * 6 + 2 + 4);
      buf.writeUInt16LE(points[i].z, i * 6 + 4 + 4);
    }
  });

  bench('hand-written - DataView', () => {
    const buf = new ArrayBuffer(4 + n * 2 * 3);
    const dataView = new DataView(buf);
    dataView.setUint32(points.length, 0, true);
    for (let i = 0; i < points.length; i++) {
      dataView.setUint16(points[i].x, i * 6 + 0 + 4, true);
      dataView.setUint16(points[i].y, i * 6 + 2 + 4, true);
      dataView.setUint16(points[i].z, i * 6 + 4 + 4, true);
    }
  });

  bench('ebin', () => {
    EbinPoints.toByteArray({ points } as any);
  });

  bench('binary-parser-encoder', () => {
    BPEPoints.encode({ points });
  });

  bench('destruct-js', () => {
    destructSpec.write({ len: points.length, points });
  });

  bench('structron', () => {
    StructronPoints.write({ points });
  });
});
