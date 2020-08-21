import CompiledLVZImage from './lvz/compiled/CompiledLVZImage';
import CompiledLVZMapObject from './lvz/compiled/CompiledLVZMapObject';
import CompiledLVZScreenObject from './lvz/compiled/CompiledLVZScreenObject';
import CompressedLVZPackage from './lvz/binary/CompressedLVZPackage';
import CompressedLVZSection from './lvz/binary/CompressedLVZSection';
import DecompressedLVZSection from './lvz/binary/DecompressedLVZSection';
import { LVZDisplayMode, LVZRenderLayer, LVZXType, LVZYType } from './lvz/LVZProperties';
import LVZCollection from './lvz/object/LVZCollection';
import LVZImage from './lvz/object/LVZImage';
import LVZMapObject from './lvz/object/LVZMapObject';
import LVZPackage from './lvz/compiled/LVZPackage';
import LVZResource from './lvz/LVZResource';
import LVZScreenObject from './lvz/object/LVZScreenObject';

import {
  readLVZ,
  writeLVZ,
  compressLVZ,
  decompressLVZ,
  processSection,
  compressObjects,
  loadTexture,
  validateDecompressedLVZScreenObject,
  validateLVZScreenObject,
  validateDecompressedLVZMapObject,
  validateLVZMapObject,
  validateLVZCompiledImage,
  validateLVZImage,
  validateLVZResource
} from './lvz/LVZUtils';

const IMAGE_ANIMATION_TIME_MIN = 0;
const IMAGE_ANIMATION_TIME_MAX = 100000000;
const IMAGE_FRAME_COUNT_MIN = 1;
const IMAGE_FRAME_COUNT_MAX = 32767;
const RESOURCE_TIME_MIN = 0;
const MAP_OBJECT_COORDINATE_MIN = -32767;
const MAP_OBJECT_COORDINATE_MAX = 32767;
const SCREEN_OBJECT_COORDINATE_MIN = -2048;
const SCREEN_OBJECT_COORDINATE_MAX = 2047;
const OBJECT_ID_MIN = 0;
const OBJECT_ID_MAX = 32767;
const COORDINATE_TYPE_MIN = 0;
const COORDINATE_TYPE_MAX = 11;
const DISPLAY_MODE_MIN = 0;
const DISPLAY_MODE_MAX = 5;
const RENDER_LAYER_MIN = 0;
const RENDER_LAYER_MAX = 7;
const DISPLAY_TIME_MIN = 0;
const DISPLAY_TIME_MAX = 100000000;

export {
  // Binary objects.
  CompiledLVZImage, CompiledLVZMapObject, CompiledLVZScreenObject,
  CompressedLVZPackage, CompressedLVZSection,
  DecompressedLVZSection,
  // Objects.
  LVZCollection, LVZImage, LVZMapObject, LVZPackage, LVZResource, LVZScreenObject,

  // Properties.
  LVZDisplayMode, LVZRenderLayer, LVZXType, LVZYType,

  // Utility functions.
  readLVZ,
  writeLVZ,
  compressLVZ,
  decompressLVZ,
  processSection,
  compressObjects,
  loadTexture,
  validateDecompressedLVZScreenObject,
  validateLVZScreenObject,
  validateDecompressedLVZMapObject,
  validateLVZMapObject,
  validateLVZCompiledImage,
  validateLVZImage,
  validateLVZResource,

  // Flags.
  IMAGE_ANIMATION_TIME_MIN,
  IMAGE_ANIMATION_TIME_MAX,
  IMAGE_FRAME_COUNT_MIN,
  IMAGE_FRAME_COUNT_MAX,
  RESOURCE_TIME_MIN,
  MAP_OBJECT_COORDINATE_MIN,
  MAP_OBJECT_COORDINATE_MAX,
  SCREEN_OBJECT_COORDINATE_MIN,
  SCREEN_OBJECT_COORDINATE_MAX,
  OBJECT_ID_MIN,
  OBJECT_ID_MAX,
  COORDINATE_TYPE_MIN,
  COORDINATE_TYPE_MAX,
  DISPLAY_MODE_MIN,
  DISPLAY_MODE_MAX,
  RENDER_LAYER_MIN,
  RENDER_LAYER_MAX,
  DISPLAY_TIME_MIN,
  DISPLAY_TIME_MAX
};
