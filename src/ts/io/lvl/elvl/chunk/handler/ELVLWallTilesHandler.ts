import ELVLWallTiles from '../ELVLWallTiles';
import ELVLChunkHandler from './ELVLChunkHandler';

/**
 * The <i>ELVLWallTilesHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLWallTilesHandler extends ELVLChunkHandler<ELVLWallTiles> {

  constructor() {
    super('DCWT');
  }

  read(buffer: Buffer): ELVLWallTiles {
    if (buffer.length != 16) {
      throw new Error(
        `The size for DCME Wall-Tile chunks can only be 16. (${buffer.length} given)`);
    }
    // Read the 16 tiles.
    const tiles: number[] = new Array(16);
    for (let index = 0; index < 16; index++) {
      tiles[index] = buffer.readUInt8(index);
    }
    return new ELVLWallTiles(tiles);
  }

  write(chunk: ELVLWallTiles): Buffer {
    chunk.validate();
    const buffer = Buffer.alloc(16);
    // Write each tile ID as the offset of the index.
    for (let index = 0; index < 16; index++) {
      buffer.writeUInt8(chunk.tiles[index], index);
    }
    return buffer;
  }
}
