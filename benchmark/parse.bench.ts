import { bench } from 'vitest';

import { bp } from 'binparse';
// @ts-ignore
import { Parser } from 'binary-parser';
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

// binparse
const PointParser = bp.object('Point', {
  x: bp.lu16,
  y: bp.lu16,
  z: bp.lu16,
});

const PointsParser = bp.object('SimpleObject', {
  length: bp.lu32,
  points: bp.array('Points', PointParser, 'length'),
});

// binary-parser
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
const buf = Buffer.alloc(4 + n * 2 * 3);

buf.writeUInt32LE(n, 0);
for (let i = 0; i < n; i++) {
  buf.writeUInt16LE(123, i * 6 + 0 + 4);
  buf.writeUInt16LE(456, i * 6 + 2 + 4);
  buf.writeUInt16LE(789, i * 6 + 4 + 4);
}

bench('hand-written - Buffer', () => {
  const n = buf.readUInt32LE(0);
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push({
      x: buf.readUInt16LE(i * 6 + 0 + 4),
      y: buf.readUInt16LE(i * 6 + 2 + 4),
      z: buf.readUInt16LE(i * 6 + 4 + 4),
    });
  }
});

bench('hand-written - DataView', () => {
  const dataView = new DataView(new Uint8Array(buf).buffer);
  const n = dataView.getUint32(0, true);
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push({
      x: dataView.getUint16(i * 6 + 0 + 4, true),
      y: dataView.getUint16(i * 6 + 2 + 4, true),
      z: dataView.getUint16(i * 6 + 4 + 4, true),
    });
  }
});

bench('ebin', () => {
  const points = EbinPoints.fromByteArray(buf);
});

bench('binparse', () => {
  const points = PointsParser.read(buf);
});

bench('binary-parser', () => {
  const points = Points.parse(buf);
});

bench('destruct-js', () => {
  const points = spec.read(buf);
});

bench('structron', () => {
  const points = PointsStruct.read(buf, 0);
});
