import { bit, bits, struct, uint16, uint32 } from '../src';

export const tcpHeader = struct({
  srcPort: uint16(),
  dstPort: uint16(),
  seq: uint32(),
  ack: uint32(),
  dataOffset: bits(4),
  reserved: bits(6),
  flags: struct({
    urg: bit(),
    ack: bit(),
    psh: bit(),
    rst: bit(),
    syn: bit(),
    fin: bit(),
  }),
  windowSize: uint16(),
  checksum: uint16(),
  urgentPointer: uint16(),
}).bigEndian();
