import * as zlib from "zlib";
import DecompressedLVZSection from './DecompressedLVZSection';

/**
 * The <i>CompressedLVZSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompressedLVZSection {

  public readonly decompressSize: number;
  public readonly fileTime: number;
  public readonly compressSize: number;
  public readonly fileName: string;
  public readonly data: Buffer;

  /**
   * Main constructor.
   *
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
  }

  /**
   * Inflates the binary LVZ data section to parsable data.
   *
   * @return {DecompressedLVZSection}
   */
  public inflate(): DecompressedLVZSection {
    let data: Buffer = zlib.inflateSync(this.data);
    return new DecompressedLVZSection(this.decompressSize, this.fileTime, this.compressSize, this.fileName, data);
  }
}

export default CompressedLVZSection;
