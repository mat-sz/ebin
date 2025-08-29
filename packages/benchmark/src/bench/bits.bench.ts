import { bench } from 'vitest';

import * as e from 'ebin';
import { bp } from 'binparse';
// @ts-ignore
import { Parser } from 'binary-parser';
import { Parser as Encoder } from 'binary-parser-encoder';
import Destruct from 'destruct-js';

// ebin
const EbinPoints = e
  .struct({
    length: e.uint32(),
    points: e
      .array(
        e.bits({
          x: 4,
          y: 2,
          z: 2,
        }),
      )
      .count('length'),
  })
  .littleEndian();

// binparse
const BinparsePoint = bp.bits('Point', {
  x: 4,
  y: 2,
  z: 2,
});

const BinparsePoints = bp.object('SimpleObject', {
  length: bp.lu32,
  points: bp.array('Points', BinparsePoint, 'length'),
});

// binary-parser
const BPPoints = new Parser().uint32le('len').array('points', {
  length: 'len',
  type: new Parser().bit4('x').bit2('y').bit2('z'),
});

// binary-parser-encoder
const BPEPoints = new Encoder().uint32le('len').array('points', {
  length: 'len',
  type: new Encoder().bit4('x').bit2('y').bit2('z'),
});

// destruct-js
const destructSpec = new Destruct.Spec({ mode: Destruct.Mode.LE });
destructSpec
  .field('len', Destruct.UInt32)
  .loop(
    'points',
    r => r.len,
    new Destruct.Spec({ mode: Destruct.Mode.LE })
      .field('x', Destruct.Bits4)
      .field('y', Destruct.Bits2)
      .field('z', Destruct.Bits2),
  );

// Prepare input
const n = 1000;
const buf = Buffer.alloc(4 + n);

buf.writeUInt32LE(n, 0);
for (let i = 0; i < n; i++) {
  buf.writeUInt8(0b11110011, i + 4);
}

const arrayBuffer = new Uint8Array(buf).buffer;

const points: { x: number; y: number; z: number }[] = [];

for (let i = 0; i < n; i++) {
  points.push({ x: 0b1111, y: 0b00, z: 0b11 });
}

describe('parse', () => {
  bench('hand-written - Buffer', () => {
    const n = buf.readUInt32LE(0);
    const points = new Array(n);
    for (let i = 0; i < n; i++) {
      const val = buf.readUInt8(i + 4);
      points[i] = {
        x: (val >> 4) & 0b1111,
        y: (val >> 2) & 0b11,
        z: val & 0b11,
      };
    }
  });

  bench('hand-written - DataView', () => {
    const dataView = new DataView(arrayBuffer);
    const n = dataView.getUint32(0, true);
    const points = new Array(n);
    for (let i = 0; i < n; i++) {
      const val = dataView.getUint8(i + 4);
      points[i] = {
        x: (val >> 4) & 0b1111,
        y: (val >> 2) & 0b11,
        z: val & 0b11,
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
});

describe('serialize', () => {
  bench('hand-written - Buffer', () => {
    const buf = Buffer.alloc(4 + n);
    buf.writeUInt32LE(points.length, 0);
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      buf.writeUInt8((point.x << 4) | (point.y << 2) | point.z, i + 4);
    }
  });

  bench('hand-written - DataView', () => {
    const buf = new Uint8Array(4 + n).buffer;
    const dataView = new DataView(buf);
    dataView.setUint32(points.length, 0, true);
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      dataView.setUint8(i + 4, (point.x << 4) | (point.y << 2) | point.z);
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
});
