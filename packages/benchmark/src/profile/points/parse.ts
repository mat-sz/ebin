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
const buf = Buffer.alloc(4 + n * 2 * 3);

buf.writeUInt32LE(n, 0);
for (let i = 0; i < n; i++) {
  buf.writeUInt16LE(123, i * 6 + 0 + 4);
  buf.writeUInt16LE(456, i * 6 + 2 + 4);
  buf.writeUInt16LE(789, i * 6 + 4 + 4);
}

export function run() {
  EbinPoints.fromByteArray(buf);
}
