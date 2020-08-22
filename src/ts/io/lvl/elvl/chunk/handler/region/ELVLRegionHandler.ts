import BufferUtils from '../../../../../../util/BufferUtils';
import ELVLChunkHandler from '../ELVLChunkHandler';
import ELVLRegion from '../../region/ELVLRegion';
import ELVLRegionChunk from '../../region/ELVLRegionChunk';
import ELVLRegionTileData from '../../region/ELVLRegionTileData';
import ELVLRegionAutoWarp from '../../region/ELVLRegionAutoWarp';
import ELVLRegionRawChunk from '../../region/ELVLRegionRawChunk';
import { ELVL_HANDLERS, ELVL_REGION_HANDLERS } from '../../../../../LVL';
import { DEBUG } from '../../../ELVLUtils';
import ELVLChunk from '../../ELVLChunk';
import ELVLRegionTileMapHandler from './ELVLRegionTileMapHandler';
import ELVLRegionAutoWarpHandler from './ELVLRegionAutoWarpHandler';

/**
 * The <i>ELVLRegionHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLRegionHandler extends ELVLChunkHandler<ELVLRegion> {

  constructor() {
    super('REGN');
  }

  /** @override */
  read(buffer: Buffer): ELVLRegion {
    let offset = 0;
    let name: string = null;
    let tileData: ELVLRegionTileData = null;
    let autoWarp: ELVLRegionAutoWarp = null;
    const chunks: ELVLRegionChunk[] = [];
    let pythonCode: string = null;
    const color: number[] = [0, 0, 0];

    const options = {
      isFlagBase: false,
      noAntiWarp: false,
      noWeapons: false,
      noFlagDrops: false
    };

    while (offset < buffer.length) {
      const subChunkId = BufferUtils.readFixedString(buffer, offset, 4);
      const subChunkSize = buffer.readUInt32LE(offset + 4);
      const subChunkBuffer = buffer.subarray(offset + 8, offset + 8 + subChunkSize);
      offset += 8 + subChunkSize;
      // Pad to the next 4 bytes.
      const remainder = subChunkSize % 4;
      if (remainder != 0) {
        offset += 4 - remainder;
      }
      if (subChunkId === 'rNAM') {
        name = BufferUtils.readFixedString(subChunkBuffer, 0, subChunkSize);
      } else if (subChunkId === 'rTIL') {
        tileData = (<ELVLRegionTileMapHandler> ELVL_REGION_HANDLERS['rTIL']).read(subChunkBuffer);
      } else if (subChunkId === 'rBSE') {
        options.isFlagBase = true;
      } else if (subChunkId === 'rNAW') {
        options.noAntiWarp = true;
      } else if (subChunkId === 'rNWP') {
        options.noWeapons = true;
      } else if (subChunkId === 'rNFL') {
        options.noFlagDrops = true;
      } else if (subChunkId === 'rAWP') {
        autoWarp = (<ELVLRegionAutoWarpHandler> ELVL_REGION_HANDLERS['rAWP']).read(subChunkBuffer);
      } else if (subChunkId === 'rPYC') {
        pythonCode = BufferUtils.readFixedString(subChunkBuffer, 0, subChunkSize);
      } else if (subChunkId === 'rCOL') {
        color[0] = subChunkBuffer.readUInt8(0);
        color[1] = subChunkBuffer.readUInt8(1);
        color[2] = subChunkBuffer.readUInt8(2);
      } else {
        const handler = ELVL_HANDLERS[subChunkId];
        if (handler == null) {
          if (DEBUG) {
            console.warn(`Unknown ELVL Chunk ID '${subChunkId}'. Adding as raw data chunk.`);
          }
          chunks.push(new ELVLRegionRawChunk(subChunkId, subChunkBuffer));
          continue;
        }
        if (DEBUG) {
          console.log(`Reading ELVL Chunk '${subChunkId}'. (${subChunkSize} byte(s))`);
        }
        chunks.push(handler.read(subChunkBuffer));
      }
    }

    const region = new ELVLRegion(name, options, tileData, autoWarp, pythonCode, chunks);
    region.color = color;
    return region;
  }

  /** @override */
  write(chunk: ELVLChunk): Buffer {
    return null;
  }
}
