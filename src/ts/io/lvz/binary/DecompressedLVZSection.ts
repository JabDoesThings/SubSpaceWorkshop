import * as zlib from "zlib";
import CompressedLVZSection from './CompressedLVZSection';

/**
 * The <i>DecompressedLVZSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class DecompressedLVZSection {

  public readonly decompressSize: number;
  public readonly fileTime: number;
  public readonly compressSize: number;
  public readonly fileName: string;
  public readonly data: Buffer;
  public readonly isObjectSection: boolean;

  /**
   * @param {number} decompressSize
   * @param {number} fileTime
   * @param {number} compressSize
   * @param {string} fileName
   * @param {Buffer} data
   */
  constructor(decompressSize: number, fileTime: number, compressSize: number, fileName: string, data: Buffer) {
    this.decompressSize = decompressSize;
    this.fileTime = fileTime;
    this.compressSize = compressSize;
    this.fileName = fileName;
    this.data = data;
    this.isObjectSection = fileTime == 0;
  }

  /**
   * Compresses the LVZ data section to a writable data block.
   *
   * @return {CompressedLVZSection}
   */
  public deflate(): CompressedLVZSection {
    const fileName = this.fileName;
    const fileTime = this.fileTime;
    const decompressSize = this.data.length;
    const compressedData = zlib.deflateSync(this.data);
    const compressSize = compressedData.length;
    return new CompressedLVZSection(decompressSize, fileTime, compressSize, fileName, compressedData);
  }
}

export default DecompressedLVZSection;
