import ELVLChunk from './chunk/ELVLChunk';
import ELVLRegion from './chunk/region/ELVLRegion';
import ELVLAttribute from './chunk/ELVLAttribute';

/**
 * The <i>ELVLCollection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLCollection {
  readonly chunks: ELVLChunk[] = [];
  readonly regions: ELVLRegion[] = [];
  readonly attributes: ELVLAttribute[] = [];

  addChunk(chunk: ELVLChunk): void {
    if (chunk == null) {
      throw new Error('The ELVLChunk is null or undefined.');
    } else if (this.hasChunk(chunk)) {
      throw new Error('The ELVLChunk is already in the collection.');
    }
    this.chunks.push(chunk);
  }

  addRegion(region: ELVLRegion): void {
    if (region == null) {
      throw new Error('The ELVLRegion is null or undefined.');
    } else if (this.hasRegion(region)) {
      throw new Error('The ELVLRegion is already in the collection.');
    }
    this.regions.push(region);
  }

  hasChunk(chunk: ELVLChunk): boolean {
    if (chunk == null) {
      throw new Error('The ELVL chunk given is null or undefined.');
    }
    for (let index = 0; index < this.chunks.length; index++) {
      const next = this.chunks[index];
      if (chunk.equals(next)) {
        return true;
      }
    }
    return false;
  }

  hasAttribute(attribute: ELVLAttribute): boolean {
    if (attribute == null) {
      throw new Error('The ELVLAttribute is null or undefined.');
    }
    for (let index = 0; index < this.chunks.length; index++) {
      const next = this.chunks[index];
      if (attribute.equals(next)) {
        return true;
      }
    }
    return false;
  }

  hasRegion(region: ELVLRegion): boolean {
    if (region == null) {
      throw new Error('The ELVLRegion is null or undefined.');
    }
    for (let index = 0; index < this.chunks.length; index++) {
      const next = this.chunks[index];
      if (region.equals(next)) {
        return true;
      }
    }
    return false;
  }

  addAttribute(attribute: ELVLAttribute): void {
    if (attribute == null) {
      throw new Error('The ELVLAttribute is null or undefined.');
    } else if (this.hasAttribute(attribute)) {
      throw new Error('The ELVLAttribute is already in the collection.');
    }
    this.attributes.push(attribute);
  }

  getAttributes(): ELVLAttribute[] {
    return this.attributes;
  }

  getRegions(): ELVLRegion[] {
    return this.regions;
  }

  getChunks(): ELVLChunk[] {
    return this.chunks;
  }
}

export default ELVLCollection;
