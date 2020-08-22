import ELVLRegionChunkHandler from './ELVLRegionChunkHandler';
import ELVLRegionTileData from '../../region/ELVLRegionTileData';
import { DEBUG } from '../../../ELVLUtils';

/**
 * The <i>ELVLRegionTileMapHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLRegionTileMapHandler extends ELVLRegionChunkHandler<ELVLRegionTileData> {
  private static readonly SMALL_EMPTY_RUN = 0;
  private static readonly LONG_EMPTY_RUN = 1;
  private static readonly SMALL_PRESENT_RUN = 2;
  private static readonly LONG_PRESENT_RUN = 3;
  private static readonly SMALL_EMPTY_ROWS = 4;
  private static readonly LONG_EMPTY_ROWS = 5;
  private static readonly SMALL_REPEAT = 6;
  private static readonly LONG_REPEAT = 7;

  constructor() {
    super('rTIL');
  }

  /** @override */
  read(buffer: Buffer): ELVLRegionTileData {
    let offset = 0;

    // Create a new blank array.
    const tiles: boolean[][] = new Array(1024);
    for (let x = 0; x < 1024; x++) {
      tiles[x] = new Array(1024);
      for (let y = 0; y < 1024; y++) {
        tiles[x][y] = false;
      }
    }

    let tilesInRow: number = 0;
    let rowsCounted: number = 0;
    let byte1: number = 0;
    let byte2: number = 0;
    let value: number = 0;

    while (offset < buffer.length && rowsCounted < 1024) {
      byte1 = buffer.readUInt8(offset++);
      const b1check = Math.floor(byte1 / 32);
      if (b1check == ELVLRegionTileMapHandler.SMALL_EMPTY_RUN) {
        // 000nnnnn - n+1 (1-32) empty tiles in a row
        value = byte1 % 32 + 1;
        for (let x = tilesInRow; x < tilesInRow + value; x++) {
          tiles[x][rowsCounted] = false;
        }
        tilesInRow += value;
      } else if (b1check == ELVLRegionTileMapHandler.LONG_EMPTY_RUN) {
        // 001000nn nnnnnnnn - n+1 (1-1024) empty tiles in a row
        byte2 = buffer.readUInt8(offset++);
        value = 256 * (byte1 % 4) + byte2 + 1;
        for (let x = tilesInRow; x < tilesInRow + value; x++) {
          tiles[x][rowsCounted] = false;
        }
        tilesInRow += value;
      } else if (b1check == ELVLRegionTileMapHandler.SMALL_PRESENT_RUN) {
        // 010nnnnn - n+1 (1-32) present tiles in a row
        value = byte1 % 32 + 1;
        if (tilesInRow + value > 1024) {
          if (DEBUG) {
            console.warn(`Something's wrong. More than 1024 tiles in that row.`);
          }
        } else {
          for (let x = tilesInRow; x < tilesInRow + value; x++) {
            tiles[x][rowsCounted] = true;
          }
        }
        tilesInRow += value;
      } else if (b1check == ELVLRegionTileMapHandler.LONG_PRESENT_RUN) {
        // 011000nn nnnnnnnn - n+1 (1-1024) present tiles in a row
        byte2 = buffer.readUInt8(offset++);
        value = 256 * (byte1 % 4) + byte2 + 1;
        if (tilesInRow + value > 1024) {
          if (DEBUG) {
            console.warn(`Something's wrong. More than 1024 tiles in that row.`);
          }
        } else {
          for (let x = tilesInRow; x < tilesInRow + value; x++) {
            tiles[x][rowsCounted] = true;
          }
        }
        tilesInRow += value;
      } else if (b1check == ELVLRegionTileMapHandler.SMALL_EMPTY_ROWS) {
        // 100nnnnn - n+1 (1-32) rows of all empty
        value = byte1 % 32 + 1;
        rowsCounted += value;
      } else if (b1check == ELVLRegionTileMapHandler.LONG_EMPTY_ROWS) {
        // 101000nn nnnnnnnn - n+1 (1-1024) rows of all empty
        byte2 = buffer.readUInt8(offset++);
        value = 256 * (byte1 % 4) + byte2 + 1;
        rowsCounted += value;
      } else if (b1check == ELVLRegionTileMapHandler.SMALL_REPEAT) {
        // 110nnnnn - repeat last row n+1 (1-32) times
        value = byte1 % 32 + 1;
        // Next, copy the entire row.
        for (let x = 0; x < 1024; x++) {
          for (let y = rowsCounted; y < rowsCounted + value; y++) {
            tiles[x][y] = tiles[x][y - 1];
          }
        }
        rowsCounted += value;
      } else if (b1check == ELVLRegionTileMapHandler.LONG_REPEAT) {
        // 111000nn nnnnnnnn - repeat last row n+1 (1-1024) times
        byte2 = buffer.readUInt8(offset++);
        value = 256 * (byte1 % 4) + byte2 + 1;
        // Next, copy the entire row.
        for (let x = 0; x < 1024; x++) {
          for (let y = rowsCounted; y < rowsCounted + value; y++) {
            tiles[x][y] = tiles[x][y - 1];
          }
        }
        rowsCounted += value;
      } else {
        throw new Error(`Error in region tile data: byte1/32 = ${b1check}`);
      }
      if (tilesInRow == 1024) {
        tilesInRow = 0;
        rowsCounted += 1;
      }
    }

    return new ELVLRegionTileData(tiles);
  }

  /** @override */
  write(chunk: ELVLRegionTileData): Buffer {
    // TODO: Implement.
    return null;
  }
}
