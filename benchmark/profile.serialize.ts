import { array, struct, uint16, uint32 } from '../src/index.js';

// @ts-ignore
import { Session } from 'node:inspector/promises';
import fs from 'node:fs';

const session = new Session();
session.connect();

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

async function main() {
  await session.post('Profiler.enable');
  await session.post('Profiler.start');
  for (let i = 0; i < 8000; i++) {
    EbinPoints.toByteArray({ points });
  }

  const { profile } = await session.post('Profiler.stop');

  fs.writeFileSync('./profile.cpuprofile', JSON.stringify(profile));
}

main();
