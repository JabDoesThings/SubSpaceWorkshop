import LVLTileSet from './lvl/LVLTileSet';
import LVLMap from './lvl/LVLMap';

import ELVLCollection from './lvl/elvl/ELVLCollection';
import ELVLRegion from './lvl/elvl/chunk/region/ELVLRegion';
import ELVLRegionAutoWarp from './lvl/elvl/chunk/region/ELVLRegionAutoWarp';
import ELVLRegionChunk from './lvl/elvl/chunk/region/ELVLRegionChunk';
import ELVLRegionRawChunk from './lvl/elvl/chunk/region/ELVLRegionRawChunk';
import ELVLRegionTileData from './lvl/elvl/chunk/region/ELVLRegionTileData';
import ELVLAttribute from './lvl/elvl/chunk/ELVLAttribute';
import ELVLBookmarks from './lvl/elvl/chunk/ELVLBookmarks';
import ELVLChunk from './lvl/elvl/chunk/ELVLChunk';
import ELVLHashCode from './lvl/elvl/chunk/ELVLHashCode';
import ELVLLVZPath from './lvl/elvl/chunk/ELVLLVZPath';
import ELVLRawChunk from './lvl/elvl/chunk/ELVLRawChunk';
import ELVLTextTiles from './lvl/elvl/chunk/ELVLTextTiles';
import ELVLWallTiles from './lvl/elvl/chunk/ELVLWallTiles';
import ELVLChunkHandler from './lvl/elvl/chunk/handler/ELVLChunkHandler';

import {
  readLVL,
  writeLVL,
  readTileset,
  readTilesetImage,
  validateArea,
  validateCoordinates,
  validateRanges,
  validateTileId,
  validateTileImage,
  validateTilesetImage,
  isOutOfRange,
  canFitTiles,
  canImageFitTiles,
  contains,
  inTilesetRange,
  toTileBuffer,
  toTilesetCoords
} from './lvl/LVLUtils';
import ELVLRegionHandler from './lvl/elvl/chunk/handler/region/ELVLRegionHandler';
import ELVLAttributeHandler from './lvl/elvl/chunk/handler/ELVLAttributeHandler';
import ELVLWallTilesHandler from './lvl/elvl/chunk/handler/ELVLWallTilesHandler';
import ELVLTextTilesHandler from './lvl/elvl/chunk/handler/ELVLTextTilesHandler';
import ELVLHashCodeHandler from './lvl/elvl/chunk/handler/ELVLHashCodeHandler';
import ELVLBookmarksHandler from './lvl/elvl/chunk/handler/ELVLBookmarksHandler';
import ELVLLVZPathHandler from './lvl/elvl/chunk/handler/ELVLLVZPathHandler';
import ELVLRegionTileMapHandler from './lvl/elvl/chunk/handler/region/ELVLRegionTileMapHandler';
import ELVLRegionAutoWarpHandler from './lvl/elvl/chunk/handler/region/ELVLRegionAutoWarpHandler';
import ELVLRegionChunkHandler from './lvl/elvl/chunk/handler/region/ELVLRegionChunkHandler';

const ELVL_HANDLERS: { [id: string]: ELVLChunkHandler<ELVLChunk> } = {};
const ELVL_REGION_HANDLERS: { [id: string]: ELVLRegionChunkHandler<ELVLRegionChunk> } = {};

// #############################
// ## HANDLER ASSIGNMENT CODE ##
// #############################
ELVL_HANDLERS['ATTR'] = new ELVLAttributeHandler();
ELVL_HANDLERS['REGN'] = new ELVLRegionHandler();
ELVL_HANDLERS['DCWT'] = new ELVLWallTilesHandler();
ELVL_HANDLERS['DCTT'] = new ELVLTextTilesHandler();
ELVL_HANDLERS['DCID'] = new ELVLHashCodeHandler();
ELVL_HANDLERS['DCBM'] = new ELVLBookmarksHandler();
ELVL_HANDLERS['DCLV'] = new ELVLLVZPathHandler();
ELVL_REGION_HANDLERS['rTIL'] = new ELVLRegionTileMapHandler();
ELVL_REGION_HANDLERS['rAWP'] = new ELVLRegionAutoWarpHandler();
// #############################

/** The default tileset for SubSpace maps. */
const DEFAULT_TILESET = readTilesetImage("assets/media/tiles.png", true);
/** 16x16 pixel tiles in a 19x10 grid. */
const TILESET_DIMENSIONS: number[] = [304, 160];
/** The width and height of a map in tiles. */
const MAP_LENGTH = 1024;

const TILE_DIMENSIONS: number[][] = [];
// Create dimension array to reference for tools.
for (let index = 0; index < 256; index++) {
  TILE_DIMENSIONS[index] = new Array(2);
  if (index == 217) {
    // Large Asteroid
    TILE_DIMENSIONS[index][0] = 2;
    TILE_DIMENSIONS[index][1] = 2;
  } else if (index == 219) {
    // Station Tile
    TILE_DIMENSIONS[index][0] = 6;
    TILE_DIMENSIONS[index][1] = 6;
  } else if (index == 220) {
    // Wormhole Tile
    TILE_DIMENSIONS[index][0] = 5;
    TILE_DIMENSIONS[index][1] = 5;
  } else {
    // Other Tiles
    TILE_DIMENSIONS[index][0] = 1;
    TILE_DIMENSIONS[index][1] = 1;
  }
}

export {
  // LVL objects.
  LVLMap,
  LVLTileSet,

  // ELVL objects.
  ELVLAttribute,
  ELVLCollection,
  ELVLBookmarks,
  ELVLChunk,
  ELVLHashCode,
  ELVLLVZPath,
  ELVLRawChunk,
  ELVLRegion,
  ELVLRegionAutoWarp,
  ELVLRegionChunk,
  ELVLRegionRawChunk,
  ELVLRegionTileData,
  ELVLTextTiles,
  ELVLWallTiles,

  // Utility methods.
  readLVL,
  writeLVL,
  readTileset,
  readTilesetImage,
  validateArea,
  validateCoordinates,
  validateRanges,
  validateTileId,
  validateTileImage,
  validateTilesetImage,
  isOutOfRange,
  canFitTiles,
  canImageFitTiles,
  contains,
  inTilesetRange,
  toTileBuffer,
  toTilesetCoords,

  // Global variables.
  DEFAULT_TILESET,
  TILESET_DIMENSIONS,
  MAP_LENGTH,
  TILE_DIMENSIONS,
  ELVL_HANDLERS,
  ELVL_REGION_HANDLERS,
};
