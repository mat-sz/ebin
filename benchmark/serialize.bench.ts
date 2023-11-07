import { bench } from 'vitest';
import { Parser } from 'binary-parser-encoder';
import Destruct from 'destruct-js';
import Struct from 'structron';

import { array, struct, uint16, uint32 } from '../src/index.js';

// ebin
const EbinPoint = struct({
  x: uint16(),
  y: uint16(),
  z: uint16(),
});

const EbinPoints = struct({
  length: uint32(),
  points: array(EbinPoint),
})
  .littleEndian()
  .withCount('points', 'length');

// binary-parser-encoder
const Points = new Parser().uint32le('len').array('points', {
  length: 'len',
  type: new Parser().uint16le('x').uint16le('y').uint16le('z'),
});

// destruct-js
const spec = new Destruct.Spec({ mode: Destruct.Mode.LE });
spec
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
const PointsStruct = new Struct()
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
const points: { x: number; y: number; z: number }[] = [];

for (let i = 0; i < n; i++) {
  points.push({ x: 123, y: 456, z: 789 });
}

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
  const buf = new Uint8Array(4 + n * 2 * 3).buffer;
  const dataView = new DataView(buf);
  dataView.setUint32(points.length, 0, true);
  for (let i = 0; i < points.length; i++) {
    dataView.setUint16(points[i].x, i * 6 + 0 + 4, true);
    dataView.setUint16(points[i].y, i * 6 + 2 + 4, true);
    dataView.setUint16(points[i].z, i * 6 + 4 + 4, true);
  }
});

bench('ebin', () => {
  EbinPoints.toByteArray({ points });
});

bench('binary-parser-encoder', () => {
  Points.encode({ points });
});

bench('destruct-js', () => {
  spec.write({ len: points.length, points });
});

bench('structron', () => {
  PointsStruct.write({ points });
});
