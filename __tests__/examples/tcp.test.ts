import { tcpHeader } from '../../examples/tcp';

describe('tcp header', () => {
  it('should parse a valid TCP header', () => {
    expect(
      tcpHeader.fromByteArray(
        Buffer.from('e8a203e108e177e13d20756b801829d300410000', 'hex'),
      ),
    ).toEqual({
      srcPort: 59554,
      dstPort: 993,
      seq: 148994017,
      ack: 1025537387,
      dataOffset: 8,
      reserved: 0,
      flags: {
        urg: 0,
        ack: 1,
        psh: 1,
        rst: 0,
        syn: 0,
        fin: 0,
      },
      windowSize: 10707,
      checksum: 65,
      urgentPointer: 0,
    });
  });

  it('should serialize into a valid TCP header', () => {
    expect(
      tcpHeader.toByteArray({
        srcPort: 59554,
        dstPort: 993,
        seq: 148994017,
        ack: 1025537387,
        dataOffset: 8,
        reserved: 0,
        flags: {
          urg: 0,
          ack: 1,
          psh: 1,
          rst: 0,
          syn: 0,
          fin: 0,
        },
        windowSize: 10707,
        checksum: 65,
        urgentPointer: 0,
      }),
    ).toEqual(
      new Uint8Array(
        Buffer.from('e8a203e108e177e13d20756b801829d300410000', 'hex'),
      ),
    );
  });
});
