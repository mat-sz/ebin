import { bench } from 'vitest';

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

// Prepare input
const n = 1000;
const points: { x: number; y: number; z: number }[] = [];

for (let i = 0; i < n; i++) {
  points.push({ x: 123, y: 456, z: 789 });
}

bench('hand-written', () => {
  const buf = Buffer.alloc(4 + n * 2 * 3);
  buf.writeUInt32LE(points.length, 0);
  for (let i = 0; i < points.length; i++) {
    buf.writeUInt16LE(points[i].x, i * 6 + 0 + 4);
    buf.writeUInt16LE(points[i].y, i * 6 + 2 + 4);
    buf.writeUInt16LE(points[i].z, i * 6 + 4 + 4);
  }
});

bench('ebin', () => {
  const buf = EbinPoints.toByteArray({ points });
});
