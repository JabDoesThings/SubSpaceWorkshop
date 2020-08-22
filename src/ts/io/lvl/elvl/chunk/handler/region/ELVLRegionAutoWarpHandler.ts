import BufferUtils from '../../../../../../util/BufferUtils';
import ELVLRegionChunkHandler from './ELVLRegionChunkHandler';
import ELVLRegionAutoWarp from '../../region/ELVLRegionAutoWarp';

/**
 * The <i>ELVLRegionAutoWarpHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLRegionAutoWarpHandler extends ELVLRegionChunkHandler<ELVLRegionAutoWarp> {

  constructor() {
    super('rAWP');
  }

  /** @override */
  read(buffer: Buffer): ELVLRegionAutoWarp {
    const x = buffer.readInt16LE(0);
    const y = buffer.readInt16LE(2);
    let arena: string = null;

    if (buffer.length > 4) {
      arena = BufferUtils.readFixedString(buffer, 4, buffer.length - 4);
    }

    return new ELVLRegionAutoWarp(x, y, arena);
  }

  /** @override */
  write(chunk: ELVLRegionAutoWarp): Buffer {
    chunk.validate();
    const arena = chunk.arena;
    const buffer: Buffer = Buffer.alloc(arena != null ? 4 + arena.length : 4);
    buffer.writeUInt16LE(chunk.x, 0);
    buffer.writeUInt16LE(chunk.y, 2);
    if (arena != null) {
      BufferUtils.writeFixedString(buffer, arena, 4);
    }
    return buffer;
  }
}
