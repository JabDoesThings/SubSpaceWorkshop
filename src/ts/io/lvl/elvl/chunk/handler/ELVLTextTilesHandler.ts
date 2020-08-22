import ELVLChunkHandler from './ELVLChunkHandler';
import ELVLTextTiles from '../ELVLTextTiles';

/**
 * The <i>ELVLTextTilesHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLTextTilesHandler extends ELVLChunkHandler<ELVLTextTiles> {

  constructor() {
    super('DCTT');
  }

  /** @override */
  read(buffer: Buffer): ELVLTextTiles {
    // Create a blank character map.
    const charMap = new Array(256);
    for (let index = 0; index < charMap.length; index++) {
      charMap[index] = 0;
    }
    let offset = 0;
    while (offset < buffer.length) {
      const charValue = buffer.readUInt8(offset++);
      charMap[charValue] = buffer.readUInt8(offset++);
    }
    return new ELVLTextTiles(charMap);
  }

  /** @override */
  write(chunk: ELVLTextTiles): Buffer {
    chunk.validate();
    // Create a binary character map to write to a buffer.
    const map = [];
    for (let index = 0; index < chunk.charMap.length; index++) {
      let tileId = chunk.charMap[index];
      if (tileId > 0) {
        map.push(index);
        map.push(tileId);
      }
    }
    // Write the binary character map to the buffer.
    const buffer = Buffer.alloc(map.length);
    for (let index = 0; index < map.length; index++) {
      buffer.writeUInt8(map[index], index);
    }
    return buffer;
  }
}
