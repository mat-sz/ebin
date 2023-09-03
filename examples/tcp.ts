import { struct, uint16, uint32 } from '../src';

export const tcpHeader = struct({
  srcPort: uint16(),
  dstPort: uint16(),
  seq: uint32(),
  ack: uint32(),
  flags: uint16(),
  windowSize: uint16(),
  checksum: uint16(),
  urgentPointer: uint16(),
}).bigEndian();
