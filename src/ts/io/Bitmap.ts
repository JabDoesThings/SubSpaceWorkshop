/**
 * The <i>BitmapHeader</i> class. TODO: Document.
 *
 * @author Jab
 */
export class BitmapHeader {
  readonly bfType: number;
  readonly bfSize: number;
  readonly bfReserved1: number;
  readonly bfReserved2: number;
  readonly bfOffBits: number;
  readonly biSize: number;
  readonly biWidth: number;
  readonly biHeight: number;
  readonly biPlanes: number;
  readonly bitCount: number;
  readonly biCompression: number;
  readonly biSizeImage: number;
  readonly biXPelsPerMeter: number;
  readonly biYPelsPerMeter: number;
  pixelOffset: number;
  biClrUsed: number;
  biClrImportant: number;

  constructor(buffer: Buffer) {
    // File Header
    this.bfType = buffer.readUInt16LE(0);
    this.bfSize = buffer.readUInt32LE(2);
    this.bfReserved1 = buffer.readUInt16LE(6);
    this.bfReserved2 = buffer.readUInt16LE(8);
    this.bfOffBits = buffer.readUInt32LE(10);
    // Info Header
    this.biSize = buffer.readUInt32LE(14);
    this.biWidth = buffer.readUInt32LE(18);
    this.biHeight = buffer.readUInt32LE(22);
    this.biPlanes = buffer.readUInt16LE(26);
    this.bitCount = buffer.readUInt16LE(28);
    this.biCompression = buffer.readUInt32LE(30);
    this.biSizeImage = buffer.readUInt32LE(34);
    this.biXPelsPerMeter = buffer.readInt32LE(38);
    this.biYPelsPerMeter = buffer.readInt32LE(42);
    this.biClrUsed = buffer.readUInt32LE(46);
    this.biClrImportant = buffer.readUInt32LE(50);

    if (Bitmap.DEBUG) {
      console.log(`this.bfType=${this.bfType}`);
      console.log(`this.bfSize=${this.bfSize}`);
      console.log(`this.bfReserved1=${this.bfReserved1}`);
      console.log(`this.bfReserved2=${this.bfReserved2}`);
      console.log(`this.bfOffBits=${this.bfOffBits}`);
      console.log(`this.biSize=${this.biSize}`);
      console.log(`this.biWidth=${this.biWidth}`);
      console.log(`this.biHeight=${this.biHeight}`);
      console.log(`this.biPlanes=${this.biPlanes}`);
      console.log(`this.bitCount=${this.bitCount}`);
      console.log(`this.biCompression=${this.biCompression}`);
      console.log(`this.biSizeImage=${this.biSizeImage}`);
      console.log(`this.biXPelsPerMeter=${this.biXPelsPerMeter}`);
      console.log(`this.biYPelsPerMeter=${this.biYPelsPerMeter}`);
      console.log(`this.biClrUsed=${this.biClrUsed}`);
      console.log(`this.biClrImportant=${this.biClrImportant}`);
    }
  }
}

/**
 * The <i>Bitmap</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Bitmap {

  public static readonly DEBUG = false;

  readonly header: BitmapHeader;

  private readonly colorTable: any[];
  private readonly colorTableRGB: any[];
  private readonly stride: number;
  private readonly pixels: Uint8Array;

  constructor(buffer: Buffer, transparent: boolean = false) {
    const header = this.header = new BitmapHeader(buffer);
    if (header.biClrUsed == 0 && header.bitCount == 8) {
      header.biClrUsed = 256;
      header.biClrImportant = 256;
    }

    // Define our color tables/colors used
    this.colorTable = new Array(header.biClrUsed);
    this.colorTableRGB = new Array(header.biClrUsed);

    if (header.bitCount <= 8) {
      let pixelOffset = 14 + header.biSize;

      // Read in the color table
      for (let i = 0; i < header.biClrUsed; i++) {
        this.colorTable[i] = buffer.readUInt32LE(pixelOffset);
        const argb = this.colorTable[i];
        const alpha = (argb >> 24) & 0xFF;
        const red = (argb >> 16) & 0xFF;
        const green = (argb >> 8) & 0xFF;
        const blue = (argb >> 0) & 0xFF;
        this.colorTableRGB[i] = [red, green, blue, alpha];

        // Make black transparent. SS specific need, will adjust to be dynamic
        if (transparent && this.colorTable[i] == 0xff000000) {
          this.colorTable[i] = this.colorTable[i] & 0x00000000;
        }

        pixelOffset += 4;
      }

      header.pixelOffset = pixelOffset;
    }

    this.stride = Math.floor((header.bitCount * header.biWidth + 31) / 32) * 4;
    this.pixels = new Uint8Array(buffer.subarray(header.bfOffBits), 0);
  }

  public convertToImageData(): ImageData {
    const header = this.header;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(header.biWidth, header.biHeight);

    if (header.bitCount == 24) {
      for (let y = 0; y < header.biHeight; y++) {
        for (let x = 0; x < header.biWidth; x++) {
          const index1 = (x + header.biWidth * ((header.biHeight - 1) - y)) * 4;
          const index2 = (x * 3 + this.stride * y);
          imageData.data[index1] = this.pixels[index2 + 2];
          imageData.data[index1 + 1] = this.pixels[index2 + 1];
          imageData.data[index1 + 2] = this.pixels[index2];
          imageData.data[index1 + 3] = 255;
        }
      }

    } else if (header.bitCount <= 8) {
      const m_image: number[] = new Array(header.biWidth * header.biHeight);
      for (let index = 0; index < header.biWidth * header.biHeight; index++) {
        m_image[index] = this.pixels[index];
      }

      for (let y = 0; y < header.biHeight; y++) {
        for (let x = 0; x < header.biWidth; x++) {
          const dataIndex = (x + header.biWidth * ((header.biHeight - 1) - y)) * 4;
          const rgb = m_image[x + this.stride * y];
          imageData.data[dataIndex] = this.colorTableRGB[rgb][0];
          imageData.data[dataIndex + 1] = this.colorTableRGB[rgb][1];
          imageData.data[dataIndex + 2] = this.colorTableRGB[rgb][2];
          imageData.data[dataIndex + 3] = 255;
        }
      }
    }
    return imageData;
  }

  /**
   *
   * @param source
   * @param bitCount
   * @param dummy Set to true to save to a 1x1 bitmap.
   */
  static toBuffer(source: HTMLCanvasElement, bitCount: number, dummy: boolean = false) {
    const sw = dummy ? 1 : source.width;
    const sh = dummy ? 1 : source.height;
    const ctx = source.getContext("2d");
    const imageData = ctx.getImageData(0, 0, sw, sh);

    let buffer: Buffer;
    let headerLength = 54; /* 24-Bit header. */

    if (bitCount == 24) {
      let pixels: Buffer;
      let stride = Math.floor((24 * sw + 31) / 32) * 4;
      pixels = Buffer.alloc(sw * sh * 3);

      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const imgDataIndex = (x + sw * ((sh - 1) - y)) * 4;
          const pixelIndex = (x * 3 + stride * y);
          pixels[pixelIndex] = imageData.data[imgDataIndex + 2];
          pixels[pixelIndex + 1] = imageData.data[imgDataIndex + 1];
          pixels[pixelIndex + 2] = imageData.data[imgDataIndex];
        }
      }

      let length: number;
      length = headerLength + pixels.length;
      buffer = Buffer.alloc(length);
      pixels.copy(buffer, headerLength);

    } else if (bitCount == 8) {
      const colorPixelInfo = new PaletteData(source.getContext('2d').getImageData(0, 0, sw, sh));
      if (colorPixelInfo.colorAmount() > 256) {
        colorPixelInfo.compress(256);
      } else if (colorPixelInfo.colorAmount() < 256) {
        colorPixelInfo.pad(256);
      }
      const colorTable = colorPixelInfo.toColorTable();
      const colorBuffer = Buffer.alloc(colorTable.length);
      for (let index = 0; index < colorTable.length; index += 4) {
        const red = colorTable[index];
        const green = colorTable[index + 1];
        const blue = colorTable[index + 2];
        const abgr = (0 << 24) | (red << 16) | (green << 8) | blue;
        colorBuffer.writeInt32LE(abgr, index);
      }

      const colorPixels = colorPixelInfo.pixels;
      const pixelBuffer = Buffer.alloc(colorPixels.length);

      let offset = 0;
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          let dataIndex = (x + sw * ((sh - 1) - y));
          pixelBuffer.writeUInt8(colorPixels[dataIndex++], offset++);
        }
      }

      const length = headerLength + colorBuffer.length + pixelBuffer.length;
      buffer = Buffer.alloc(length);
      colorBuffer.copy(buffer, headerLength);
      if (!dummy) {
        pixelBuffer.copy(buffer, headerLength + 1024);
      }
    }

    // File Header
    buffer.writeUInt16LE(19778, 0); // bfType
    buffer.writeUInt32LE(buffer.length, 2); // bfSize
    buffer.writeUInt16LE(0, 6); // bfReserved1
    buffer.writeUInt16LE(0, 8); // bfReserved2
    buffer.writeUInt32LE(40, 14); // biSize

    // Info Header
    buffer.writeUInt32LE(sw, 18); // biWidth
    buffer.writeUInt32LE(sh, 22); // biHeight
    buffer.writeUInt16LE(1, 26); // biPlanes
    buffer.writeUInt16LE(bitCount, 28); // bitCount
    buffer.writeUInt32LE(0, 30); // biCompression
    buffer.writeUInt32LE(0, 38); // biXPelsPerMeter
    buffer.writeUInt32LE(0, 42); // biYPelsPerMeter

    if (bitCount == 24) {
      buffer.writeUInt32LE(54, 10); // bfOffBits
      buffer.writeUInt32LE(sw * sh * 3 /*145920*/, 34); // biSizeImage
      buffer.writeUInt32LE(0, 46); // biClrUsed
      buffer.writeUInt32LE(0, 50); // biClrImportant
    } else if (bitCount == 8) {
      // 1024 color table + 54 header.
      buffer.writeUInt32LE(1078, 10); // bfOffBits
      buffer.writeUInt32LE(sw * sh, 34); // biSizeImage
      buffer.writeUInt32LE(256, 46); // biClrUsed
      buffer.writeUInt32LE(256, 50); // biClrImportant
    }

    return buffer;
  }
}

/**
 * The <i>PaletteData</i> class. TODO: Document.
 *
 * @author Jab
 */
export class PaletteData {
  palette: PaletteColor[];
  pixels: number[];

  constructor(data: ImageData) {
    const width = data.width;
    const height = data.height;
    const pixelCount = width * height;

    this.pixels = new Array(pixelCount);
    this.palette = [];

    for (let index = 0; index < pixelCount; index++) {
      const offset = index * 4;
      const r = data.data[offset];
      const g = data.data[offset + 1];
      const b = data.data[offset + 2];

      let pixelIndex = -1;
      for (let ti = 0; ti < this.palette.length; ti++) {
        let next = this.palette[ti];
        if (r === next.r && g === next.g && b === next.b) {
          pixelIndex = ti;
          break;
        }
      }

      if (pixelIndex === -1) {
        pixelIndex = this.palette.length;
        this.palette.push(new PaletteColor(r, g, b));
      }
      this.pixels[index] = pixelIndex;
    }
  }

  compress(toSize: number): void {
    if (toSize > this.colorAmount()) {
      throw new Error('Cannot compress palette because the size given is more than the size of the palette.');
    }

    const compressedPixels: number[] = [];
    for (let pi = 0; pi < this.pixels.length; pi++) {
      compressedPixels.push(this.pixels[pi]);
    }

    // Add basic colors to anchor to with color reduction so things don't look off
    //   that should be solid colors.
    const compressedTable: PaletteColor[] = [];
    compressedTable.push(new PaletteColor(0, 0, 0));
    compressedTable.push(new PaletteColor(255, 255, 255));
    compressedTable.push(new PaletteColor(255, 0, 0));
    compressedTable.push(new PaletteColor(0, 255, 0));
    compressedTable.push(new PaletteColor(255, 255, 0));
    compressedTable.push(new PaletteColor(0, 0, 255));
    compressedTable.push(new PaletteColor(0, 255, 255));
    compressedTable.push(new PaletteColor(255, 0, 255));

    for (let ti = 0; ti < this.palette.length; ti++) {
      compressedTable.push(this.palette[ti]);
    }

    if (compressedTable.length > toSize) {
      let dstThresh = 0;

      while (compressedTable.length > toSize) {
        dstThresh += 1;
        const newTable: PaletteColor[] = [];

        for (let ti = 0; ti < compressedTable.length; ti++) {
          if (newTable.length == 0) {
            newTable.push(compressedTable[ti]);
            continue;
          }
          let lowestDst = -1;
          let lowestIndex = -1;
          for (let ti2 = 0; ti2 < newTable.length; ti2++) {
            const dst = compressedTable[ti].getMeanDifference(newTable[ti2]);
            if (lowestDst == -1 || lowestDst > dst) {
              lowestDst = dst;
              lowestIndex = ti2;
            }
          }
          if (lowestDst <= dstThresh) {
            for (let pi = 0; pi < compressedPixels.length; pi++) {
              if (compressedPixels[pi] == ti) {
                compressedPixels[pi] = lowestIndex;
              }
            }
          } else {
            newTable.push(compressedTable[ti]);
          }
        }
      }
    }
  }

  pad(amount: number, color: PaletteColor = new PaletteColor(0, 0, 0)): void {
    if (color == null) {
      throw new Error("The color given is null.");
    }
    if (amount <= this.colorAmount()) {
      throw new Error("Cannot pad palette because the size given is less than the size of the palette.");
    }

    while (this.palette.length < amount * 4) {
      // Pad with the color 'black'.
      this.palette.push(color);
    }
  }

  toColorTable(): number[] {
    const size = this.colorAmount();
    const table: number[] = new Array(size * 4);
    for (let ti = 0; ti < 256; ti++) {
      const offset = ti * 4;
      table[offset] = this.palette[ti].r;
      table[offset + 1] = this.palette[ti].g;
      table[offset + 2] = this.palette[ti].b;
      table[offset + 3] = 0;
    }
    return table;
  }

  colorAmount(): number {
    return this.palette.length;
  }
}

/**
 * The <i>PaletteColor</i> class. TODO: Document.
 *
 * @author Jab
 */
export class PaletteColor {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  getMeanDifference(other: PaletteColor): number {
    let r = Math.abs(this.r - other.r);
    let g = Math.abs(this.g - other.g);
    let b = Math.abs(this.b - other.b);
    return r + g + b / 3.0;
  }
}
