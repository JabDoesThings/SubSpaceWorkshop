import { BufferUtils } from '../../../../../util/BufferUtils';
import ELVLChunkHandler from './ELVLChunkHandler';
import ELVLHashCode from '../ELVLHashCode';

/**
 * The <i>ELVLHashCodeHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLHashCodeHandler extends ELVLChunkHandler<ELVLHashCode> {

  constructor() {
    super('DCID');
  }

  /** @override */
  read(buffer: Buffer): ELVLHashCode {
    const hashCode = BufferUtils.readFixedString(buffer, 0, buffer.length);
    return new ELVLHashCode(hashCode);
  }

  /** @override */
  write(chunk: ELVLHashCode): Buffer {
    chunk.validate();
    const buffer = Buffer.alloc(chunk.hashCode.length);
    BufferUtils.writeFixedString(buffer, chunk.hashCode, 0);
    return buffer;
  }
}

export default ELVLHashCodeHandler;
