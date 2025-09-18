import * as e from 'ebin';

// ebin
const EbinStrings = e
  .struct({
    strings: e.array(e.string().size(4)).count(e.uint32()),
  })
  .littleEndian();

// Prepare input

function randomString(length = 4) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const n = 1000;
const size = 4;
const buf = Buffer.alloc(4 + n * size);

buf.writeUInt32LE(n, 0);
for (let i = 0; i < n; i++) {
  const str = randomString();
  for (let j = 0; j < str.length; j++) {
    buf.writeUInt8(str.charCodeAt(j), 4 + i * size + j);
  }
}

const obj: { strings: string[] } = { strings: [] };

for (let i = 0; i < n; i++) {
  obj.strings.push(randomString());
}

export function run() {
  EbinStrings.toByteArray(obj);
}

export const config = {
  repeat: 10_000,
};
