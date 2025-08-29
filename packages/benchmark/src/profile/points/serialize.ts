import * as e from 'ebin';

// ebin
const EbinPoint = e.struct({
  x: e.uint16(),
  y: e.uint16(),
  z: e.uint16(),
});

const EbinPoints = e
  .struct({
    length: e.uint32(),
    points: e.array(EbinPoint).count('length'),
  })
  .littleEndian();

// Prepare input
const n = 1000;
const points: { x: number; y: number; z: number }[] = [];

for (let i = 0; i < n; i++) {
  points.push({ x: 123, y: 456, z: 789 });
}

export function run() {
  EbinPoints.toByteArray({ points });
}
