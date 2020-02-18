export class Bitmap {

    private bfType: number;
    private bfSize: number;
    private bfReserved1: number;
    private bfReserved2: number;
    private bfOffBits: number;
    private biSize: number;
    private biWidth: number;
    private biHeight: number;
    private biPlanes: number;
    private bitCount: number;
    private biCompression: number;
    private biSizeImage: number;
    private biXPelsPerMeter: number;
    private biYPelsPerMeter: number;
    private biClrUsed: number;
    private biClrImportant: number;
    private colorTable: any[];
    private colorTableRGB: any[];
    private pixelOffset: number;
    private stride: number;
    private pixels: Uint8Array;

    constructor(buffer: Buffer, transparent: boolean = false) {

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

        if (this.bitCount <= 8) {

            // Define our color tables/colors used
            this.colorTable = new Array(this.biClrUsed);
            this.colorTableRGB = new Array(this.biClrUsed);

            let pixelOffset = 14 + this.biSize;

            // Read in the color table
            for (let i = 0; i < this.biClrUsed; i++) {

                this.colorTable[i] = buffer.readUInt32LE(pixelOffset);
                pixelOffset += 4;

                let argb = this.colorTable[i];
                let alpha = (argb >> 24) & 0xFF;
                let red = (argb >> 16) & 0xFF;
                let green = (argb >> 8) & 0xFF;
                let blue = (argb >> 0) & 0xFF;
                this.colorTableRGB[i] = [red, green, blue, alpha];

                // Make black transparent. SS specific need, will adjust to be dynamic
                if (transparent && this.colorTable[i] == 0xff000000) {
                    this.colorTable[i] = this.colorTable[i] & 0x00000000;
                }
            }

            this.pixelOffset = pixelOffset;
        }

        this.stride = Math.floor((this.bitCount * this.biWidth + 31) / 32) * 4;
        this.pixels = new Uint8Array(buffer.subarray(this.bfOffBits), 0);
    }

    public convertToImageData(): ImageData {

        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let imageData = ctx.createImageData(this.biWidth, this.biHeight);

        if (this.bitCount == 24) {

            for (let y = 0; y < this.biHeight; y++) {
                for (let x = 0; x < this.biWidth; x++) {
                    let index1 = (x + this.biWidth * ((this.biHeight - 1) - y)) * 4;
                    let index2 = (x * 3 + this.stride * y);
                    imageData.data[index1] = this.pixels[index2 + 2];
                    imageData.data[index1 + 1] = this.pixels[index2 + 1];
                    imageData.data[index1 + 2] = this.pixels[index2];
                    imageData.data[index1 + 3] = 255;
                }
            }

        } else if (this.bitCount <= 8) {

            let m_image: number[] = new Array(this.biWidth * this.biHeight);

            for (let index = 0; index < this.biWidth * this.biHeight; index++) {
                m_image[index] = this.pixels[index];
            }

            for (let y = 0; y < this.biHeight; y++) {
                for (let x = 0; x < this.biWidth; x++) {

                    let dataIndex = (x + this.biWidth * ((this.biHeight - 1) - y)) * 4;
                    let rgb = m_image[x + this.stride * y];

                    imageData.data[dataIndex] = this.colorTableRGB[rgb][0];
                    imageData.data[dataIndex + 1] = this.colorTableRGB[rgb][1];
                    imageData.data[dataIndex + 2] = this.colorTableRGB[rgb][2];
                    imageData.data[dataIndex + 3] = 255;
                }
            }

        }
        return imageData;
    }
}
