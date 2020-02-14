import * as fs from 'fs';
import {
    LVZCompiledMapObject,
    LVZCompiledScreenObject,
    LVZCompressedPackage,
    LVZCompressedSection,
    LVZPackage,
    LVZDecompressedSection,
    LVZFile,
    LVZImage
} from './LVZ';

export class LVZ_IO {

    public static read(path: string): LVZCompressedPackage {

        let pkg = new LVZCompressedPackage(path);

        let offset: number = 0;
        let buffer: Buffer = fs.readFileSync(path);

        let header = this.readFixedString(buffer, offset, 4);
        offset += 4;

        if (header === 'CONT') {
            console.log(header);
        }

        let sectionCount = buffer.readUInt32LE(offset);
        offset += 4;

        if (sectionCount > 0) {

            for (let index = 0; index < sectionCount; index++) {

                let header = this.readFixedString(buffer, offset, 4);
                offset += 4;

                if (header !== 'CONT') {
                    continue;
                }

                let decompressSize = buffer.readUInt32LE(offset);
                offset += 4;

                let fileTime = buffer.readUInt32LE(offset);
                offset += 4;

                let compressSize = buffer.readUInt32LE(offset);
                offset += 4;

                let fileName: string = LVZ_IO.readNullString(buffer, offset);
                offset += fileName.length + 1;

                let data = buffer.subarray(offset, offset + compressSize);
                offset += compressSize;

                let compressedSection = new LVZCompressedSection(decompressSize, fileTime, compressSize, fileName, data);
                pkg.addSection(compressedSection);
            }
        }

        return pkg;
    }

    public static write(pkg: LVZCompressedPackage): void {
       // TODO: Implement.
    }

    public static compress(dPkg: LVZPackage): LVZCompressedPackage {

        let pkg = new LVZCompressedPackage(dPkg.name);

        // TODO: Implement.

        return pkg;

    }

    public static decompress(pkg: LVZCompressedPackage): LVZPackage {

        let dPkg: LVZPackage = new LVZPackage(pkg.name);

        let decompressedSections: LVZDecompressedSection[] = [];

        let count = pkg.getSectionCount();

        console.log("!!! Section count: " + count);

        for (let index = 0; index < count; index++) {
            decompressedSections[index] = pkg.sections[index].inflate();
        }

        for (let index = 0; index < count; index++) {

            let section = decompressedSections[index];

            if (section.isObjectSection) {
                LVZ_IO.processSection(dPkg, section);
            } else {
                let file = new LVZFile(section.fileName, section.fileTime, section.data);
                dPkg.addFile(file);
            }
        }

        return dPkg;
    }

    private static processSection(dPkg: LVZPackage, section: LVZDecompressedSection): void {

        let buffer = section.data;
        let offset = 0;

        let objHeader = LVZ_IO.readFixedString(buffer, offset, 4);
        offset += 4;

        let objCount = buffer.readUInt32LE(offset);
        offset += 4;

        let imgCount = buffer.readUInt32LE(offset);
        offset += 4;

        let clv1 = () => {

            for (let index = 0; index < objCount; index++) {

                /////////////////////////////////////////////
                //
                // -> CLV1 MapObject|ScreenObject
                //
                // u1	Map Object	    If TRUE, this is a Map Object. If FALSE, then is a Screen Object.
                // u15	Object ID	    The value for this object ID.
                // i16	X               The X coordinate. (In pixels)
                // i16	Y               The Y coordinate. (In pixels)
                // u8	Image Number	Which of the Image Definitions this object will use for its graphic.
                // u8	Layer	        Which layer it will be displayed on. Values for this later.
                // u12	Display Time	How long will display for, in 1/10th of a second.
                // u4	Display Mode	Which display mode this object uses. Values later.

                let first = buffer.readUInt16LE(offset);
                offset += 2;

                let id = first >>> 1;
                let type = (first & 0b0000000000000001) == 1;

                let x = buffer.readInt16LE(offset);
                offset += 2;

                let y = buffer.readInt16LE(offset);
                offset += 2;

                let image = buffer.readUInt8(offset++);
                let layer = buffer.readUInt8(offset++);

                let third = buffer.readUInt16LE(offset);
                offset += 2;

                let time = third & 0x0FFF;
                let mode = (third >> 12) & 0x03FF;

                /////////////////////////////////////////////

                if (type) {

                    let mapObject = new LVZCompiledMapObject(id, x, y, image, layer, time, mode);
                    dPkg.addMapObject(mapObject);

                } else {

                    let screenObject = new LVZCompiledScreenObject(id, 0, x, 0, y, image, layer, time, mode);
                    dPkg.addScreenObject(screenObject);
                }
            }
        };

        let clv2 = () => {

            for (let index = 0; index < objCount; index++) {

                /////////////////////////////////////////////
                //
                // u1	Map Object	If TRUE, this is a Map Object. If FALSE, then is a Screen Object.
                // u15	Object ID	The value for this object ID.

                let first = buffer.readUInt16LE(offset);
                offset += 2;

                let id = first >>> 1;
                let type = (first & 0b0000000000000001) == 1;

                /////////////////////////////////////////////

                if (type) {

                    /////////////////////////////////////////////
                    //
                    // -> CLV2 MapObject
                    //
                    // i16	X 	            The X coordinate. (In pixels)
                    // i16	Y 	            The Y coordinate. (In pixels)
                    // u8	Image Number	Which of the Image Definitions this object will use for its graphic.
                    // u8	Layer	        Which layer it will be displayed on. Values for this later.
                    // u12	Display Time	How long will display for, in 1/10th of a second.
                    // u4	Display Mode	Which display mode this object uses.

                    let xCoord = buffer.readInt16LE(offset);
                    offset += 2;

                    let yCoord = buffer.readInt16LE(offset);
                    offset += 2;

                    let imageNumber = buffer.readUInt8(offset++);

                    let layer = buffer.readUInt8(offset++);

                    let third = buffer.readUInt16LE(offset);
                    offset += 2;

                    let displayTime = third & 0x0FFF;
                    let mode = (third >> 12) & 0x03FF;

                    let mapObject = new LVZCompiledMapObject(id, xCoord, yCoord, imageNumber, layer, displayTime, mode);
                    dPkg.addMapObject(mapObject);

                } else {

                    /////////////////////////////////////////////
                    //
                    // u4	X Type          The type of screen orientation for the X coordinate.
                    // i12	X               The X coordinate. (In pixels)
                    // u4	Y Type	        The type of screen orientation for the Y coordinate.
                    // i12	Y               The Y coordinate. (In pixels)
                    // u8	Image Number	Which of the Image Definitions this object will use for its graphic.
                    // u8	Layer	        Which layer it will be displayed on.
                    // u12	Display Time	How long will display for, in 1/10th of a second.
                    // u4	Display Mode	Which display mode this object uses.

                    let second = buffer.readUInt16LE(offset);
                    offset += 2;
                    let third = buffer.readUInt16LE(offset);
                    offset += 2;

                    let xType = second & 0x0F;
                    let x = second >> 4;

                    let yType = third & 0x0F;
                    let y = third >> 4;

                    let image = buffer.readUInt8(offset++);
                    let layer = buffer.readUInt8(offset++);

                    let fourth = buffer.readUInt16LE(offset);
                    offset += 2;

                    let time = fourth & 0x0FFF;
                    let mode = (fourth >> 12) & 0x03FF;

                    /////////////////////////////////////////////

                    let screenObject = new LVZCompiledScreenObject(id, xType, x, yType, y, image, layer, time, mode);
                    dPkg.addScreenObject(screenObject);
                }
            }
        };

        if (objHeader === 'CLV1') {
            clv1();
        } else if (objHeader === 'CLV2') {
            clv2();
        }

        for (let index = 0; index < imgCount; index++) {

            /////////////////////////////////////////////
            //
            // i16	X Count	        How many columns are in this image. Used for animations.
            //
            // i16	Y Count	        How many rows are in this image.
            //
            // i16	Animation Time  How long does the whole animation lasts.
            //      NOTE: This is stored in 1/100th of a second not 1/10
            //
            // str	File Name	    This will be null ended. This is which file this image uses.
            //      The file name is not required to be included with the .lvz, and maybe in another
            //      .lvz package, or a non-zone downloaded image that users place in their folders
            //      themselves. So do not expect this file to always be in this .lvz or to be in the
            //      folder.
            //

            let animationTime = buffer.readInt16LE(offset);
            offset += 2;
            let xFrames = buffer.readInt16LE(offset);
            offset += 2;
            let yFrames = buffer.readInt16LE(offset);
            offset += 2;
            let fileName = this.readNullString(buffer, offset);
            offset += fileName.length + 1;

            /////////////////////////////////////////////

            let imageObject = new LVZImage(fileName, animationTime, xFrames, yFrames);
            dPkg.addImage(imageObject);
        }
    }

    private static readFixedString(buffer: Buffer, offset: number, length: number) {
        let s: string = '';
        for (let index = offset; index < offset + length; index++) {
            s += String.fromCharCode(buffer.readInt8(index));
        }
        return s;
    }

    private static readNullString(buffer: Buffer, offset: number) {
        let s: string = '';
        let next: number = 0;
        while ((next = buffer.readInt8(offset++)) != 0) {
            s += String.fromCharCode(next);
        }
        return s;
    }
}
