import * as e from 'ebin';

// ebin
const EbinPoint = e.bits({
  x: 4,
  y: 2,
  z: 2,
});

// Prepare input
const obj = { x: 0b1111, y: 0b00, z: 0b11 };

export function run() {
  EbinPoint.toByteArray(obj);
}
