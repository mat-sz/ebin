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
const buf = Buffer.alloc(4 + n * 2 * 3);

buf.writeUInt32LE(n, 0);
for (let i = 0; i < n; i++) {
  buf.writeUInt16LE(123, i * 6 + 0 + 4);
  buf.writeUInt16LE(456, i * 6 + 2 + 4);
  buf.writeUInt16LE(789, i * 6 + 4 + 4);
}

async function main() {
  await session.post('Profiler.enable');
  await session.post('Profiler.start');
  for (let i = 0; i < 8000; i++) {
    EbinPoints.fromByteArray(buf);
  }

  const { profile } = await session.post('Profiler.stop');

  fs.writeFileSync('./profile.cpuprofile', JSON.stringify(profile));
}

main();
