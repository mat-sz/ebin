import { bench } from 'vitest';

import * as e from 'ebin';
import { bp } from 'binparse';
// @ts-ignore
import { Parser } from 'binary-parser';
import { Parser as Encoder } from 'binary-parser-encoder';
import Destruct from 'destruct-js';
import Struct from 'structron';

// ebin
const EbinStrings = e
  .struct({
    strings: e.array(e.string().size(4)).count(e.uint32()),
  })
  .littleEndian();

// binparse
const BinparseString = bp.object('String', {
  string: bp.string(4),
});

const BinparseStrings = bp.object('SimpleObject', {
  length: bp.lu32,
  points: bp.array('Strings', BinparseString, 'length'),
});

// binary-parser
const BPStrings = new Parser().uint32le('len').array('strings', {
  length: 'len',
  type: new Parser().string('string', { length: 4 }),
});

// binary-parser-encoder
const BPEStrings = new Encoder().uint32le('len').array('strings', {
  length: 'len',
  type: new Encoder().string('string', { length: 4 }),
});

// destruct-js
const destructSpec = new Destruct.Spec({ mode: Destruct.Mode.LE });
destructSpec
  .field('len', Destruct.UInt32)
  .loop(
    'strings',
    r => r.len,
    new Destruct.Spec({ mode: Destruct.Mode.LE }).field(
      'string',
      Destruct.Text,
      { size: 4 },
    ),
  );

// structron
const StructronStrings = new Struct()
  .addMember(Struct.TYPES.UINT_LE, 'len')
  .addArray(
    new Struct().addMember(Struct.TYPES.STRING(4, 'utf-8'), 'string'),
    'strings',
    0,
    'len',
  );

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

const arrayBuffer = new Uint8Array(buf).buffer;

const obj: { strings: string[] } = { strings: [] };

for (let i = 0; i < n; i++) {
  obj.strings.push(randomString());
}

const bpeObj = { strings: obj.strings.map(str => ({ string: str })) };

describe('parse', () => {
  bench('ebin', () => {
    EbinStrings.fromArrayBuffer(arrayBuffer);
  });

  bench('binparse', () => {
    BinparseStrings.read(buf);
  });

  bench('binary-parser', () => {
    BPStrings.parse(buf);
  });

  bench('binary-parser-encoder', () => {
    BPEStrings.parse(buf);
  });

  bench('destruct-js', () => {
    destructSpec.read(buf);
  });

  bench('structron', () => {
    StructronStrings.read(buf, 0);
  });
});

describe('serialize', () => {
  bench('ebin', () => {
    EbinStrings.toByteArray(obj);
  });

  bench('binary-parser-encoder', () => {
    BPEStrings.encode(bpeObj);
  });

  bench('destruct-js', () => {
    destructSpec.write({ len: bpeObj.strings.length, strings: bpeObj.strings });
  });

  bench('structron', () => {
    StructronStrings.write(bpeObj);
  });
});
