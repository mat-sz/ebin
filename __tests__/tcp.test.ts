import { tcpHeader } from '../examples/tcp';

describe('tcp header', () => {
  it('should parse a valid TCP header', () => {
    expect(
      tcpHeader.fromByteArray(
        Buffer.from(
          'e8a203e108e177e13d20756b801829d3004100000101080a2ea486ba793310bc',
          'hex',
        ),
      ),
    ).toEqual({
      srcPort: 59554,
      dstPort: 993,
      seq: 148994017,
      ack: 1025537387,
      flags: 32792,
      windowSize: 10707,
      checksum: 65,
      urgentPointer: 0,
    });
  });
});
