import BufferUtils from '../../../../../util/BufferUtils';
import ELVLChunkHandler from './ELVLChunkHandler';
import ELVLAttribute from '../ELVLAttribute';

/**
 * The <i>ELVLAttributeHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLAttributeHandler extends ELVLChunkHandler<ELVLAttribute> {

  constructor() {
    super('ATTR');
  }

  /** @override */
  read(buffer: Buffer): ELVLAttribute {
    const ascii = BufferUtils.readFixedString(buffer, 0, buffer.length);
    const split = ascii.split('=');
    return new ELVLAttribute(split[0], split[1]);
  }

  /** @override */
  write(chunk: ELVLAttribute): Buffer {
    return null;
  }
}
