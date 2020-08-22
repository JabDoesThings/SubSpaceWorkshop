import { ELVL_HANDLERS } from '../../LVL';
import ELVLChunk from './chunk/ELVLChunk';
import ELVLRegionOptions from './ELVLRegionOptions';
import BufferUtils from '../../../util/BufferUtils';
import ELVLCollection from './ELVLCollection';
import ELVLRawChunk from './chunk/ELVLRawChunk';
import ELVLAttributeHandler from './chunk/handler/ELVLAttributeHandler';
import ELVLRegionHandler from './chunk/handler/region/ELVLRegionHandler';

export const DEFAULT_REGION_OPTIONS: ELVLRegionOptions = {
  isFlagBase: false,
  noAntiWarp: false,
  noWeapons: false,
  noFlagDrops: false,
};

export const HEADER_SIGNATURE = 1819700325 /*elvl*/;
export const DEBUG = true;

export const readELVL = (buffer: Buffer): ELVLCollection => {
  let eStartOffset;
  let eOffset = buffer.readUInt32LE(6);
  if (eOffset == 0) {
    return new ELVLCollection();
  }
  eStartOffset = eOffset;

  const signature = buffer.readUInt32LE(eOffset);
  eOffset += 4;
  if (DEBUG) {
    console.log(`offset: ${eOffset} signature: ${signature} valid_signature: ${HEADER_SIGNATURE}`);
  }
  if (signature != HEADER_SIGNATURE) {
    return;
  }
  if (DEBUG) {
    console.log('ELVL data is present.');
  }
  const eSectionLength = buffer.readUInt32LE(eOffset);
  const eSectionEnd = eStartOffset + eSectionLength;
  eOffset += 4;

  const eReserved = buffer.readUInt32LE(eOffset);
  eOffset += 4;
  if (eReserved != 0) {
    if (DEBUG) {
      console.warn(`ELVL header's 3rd UInt32 value is not 0 and is invalid.`);
    }
    return null;
  }

  const eCollection = new ELVLCollection();

  while (eOffset < eSectionEnd) {
    const cId = BufferUtils.readFixedString(buffer, eOffset, 4);
    const cSize = buffer.readUInt32LE(eOffset + 4);
    const cBuffer = buffer.subarray(eOffset + 8, eOffset + 8 + cSize);
    eOffset += 8 + cSize;
    // Pad to the next 4 bytes.
    const remainder = cSize % 4;
    if (remainder != 0) {
      eOffset += 4 - remainder;
    }
    if (cId === 'ATTR') {
      const attribute = (<ELVLAttributeHandler> ELVL_HANDLERS['ATTR']).read(cBuffer);
      eCollection.addAttribute(attribute);
    } else if (cId === 'REGN') {
      const region = (<ELVLRegionHandler> ELVL_HANDLERS['REGN']).read(cBuffer);
      eCollection.addRegion(region);
    } else {
      let chunk: ELVLChunk;
      const handler = ELVL_HANDLERS[cId];
      if (handler != null) {
        chunk = handler.read(cBuffer);
      }
      if (chunk == null) {
        if (DEBUG) {
          console.warn(`Unknown ELVL Chunk ID '${cId}'. Adding as raw data chunk.`);
        }
        eCollection.addChunk(new ELVLRawChunk(cId, cBuffer));
        continue;
      }
      eCollection.addChunk(handler.read(cBuffer));
    }
  }
  return eCollection;
};
