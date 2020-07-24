import * as fs from 'fs';
import * as zlib from 'zlib';
import * as PIXI from 'pixi.js';
import {
  LVZPackage,
  DecompressedLVZSection,
  CompiledLVZMapObject,
  CompiledLVZScreenObject,
  CompressedLVZPackage,
  CompressedLVZSection,
  CompiledLVZImage,
  LVZImage,
  LVZResource,
  LVZMapObject,
  LVZScreenObject
} from './LVZ';
import { BufferUtils } from '../util/BufferUtils';

/**
 * The <i>LVZ</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZ {

  static IMAGE_ANIMATION_TIME_MIN = 0;
  static IMAGE_ANIMATION_TIME_MAX = 100000000;
  static IMAGE_FRAME_COUNT_MIN = 1;
  static IMAGE_FRAME_COUNT_MAX = 32767;
  static RESOURCE_TIME_MIN = 0;
  static MAP_OBJECT_COORDINATE_MIN = -32767;
  static MAP_OBJECT_COORDINATE_MAX = 32767;
  static SCREEN_OBJECT_COORDINATE_MIN = -2048;
  static SCREEN_OBJECT_COORDINATE_MAX = 2047;
  static OBJECT_ID_MIN = 0;
  static OBJECT_ID_MAX = 32767;
  static COORDINATE_TYPE_MIN = 0;
  static COORDINATE_TYPE_MAX = 11;
  static DISPLAY_MODE_MIN = 0;
  static DISPLAY_MODE_MAX = 5;
  static RENDER_LAYER_MIN = 0;
  static RENDER_LAYER_MAX = 7;
  static DISPLAY_TIME_MIN = 0;
  static DISPLAY_TIME_MAX = 100000000;

  static read(path: string): CompressedLVZPackage {
    const pkg = new CompressedLVZPackage(path);
    const buffer: Buffer = fs.readFileSync(path);
    const header = BufferUtils.readFixedString(buffer, 0, 4);
    let offset: number = 4;

    if (!fs.existsSync(path)) {
      throw new Error(`The file does not exist: ${path}`);
    }
    if (header !== 'CONT') {
      throw new Error(`The file is not a valid LVZ file: ${path}`);
    }

    const sectionCount = buffer.readUInt32LE(offset);
    offset += 4;
    if (sectionCount > 0) {
      for (let index = 0; index < sectionCount; index++) {
        const header = BufferUtils.readFixedString(buffer, offset, 4);
        offset += 4;
        // Make sure the section is a valid LVZ section.
        if (header !== 'CONT') {
          continue;
        }
        const decompressSize = buffer.readUInt32LE(offset);
        offset += 4;
        const fileTime = buffer.readUInt32LE(offset);
        offset += 4;
        const compressSize = buffer.readUInt32LE(offset);
        offset += 4;
        const fileName: string = BufferUtils.readNullString(buffer, offset);
        offset += fileName.length + 1;
        const data = buffer.subarray(offset, offset + compressSize);
        offset += compressSize;
        const compressedSection = new CompressedLVZSection(decompressSize, fileTime, compressSize, fileName, data);
        pkg.addSection(compressedSection);
      }
    }
    return pkg;
  }

  static write(pkg: CompressedLVZPackage, path: string): void {
    let length = 8; // LVZ HEADER LENGTH
    for (let index = 0; index < pkg.sections.length; index++) {
      const section = pkg.sections[index];
      length += 16 + (section.fileName.length + 1) + section.data.length;
    }

    const buffer = new Buffer(length);
    let offset = 0;

    // Write LVZ Header.
    BufferUtils.writeFixedString(buffer, 'CONT', offset);
    offset += 4;
    buffer.writeUInt32LE(pkg.sections.length, offset);
    offset += 4;

    const writeSection = (section: CompressedLVZSection) => {
      BufferUtils.writeFixedString(buffer, 'CONT', offset);
      offset += 4;
      buffer.writeUInt32LE(section.decompressSize, offset);
      offset += 4;
      buffer.writeUInt32LE(section.fileTime, offset);
      offset += 4;
      buffer.writeUInt32LE(section.compressSize, offset);
      offset += 4;
      BufferUtils.writeNullString(section.fileName, buffer, offset);
      offset += section.fileName.length + 1;
      section.data.copy(buffer, offset, 0, section.data.length);
      offset += section.data.length;
    };

    // Write each section.
    for (let index = 0; index < pkg.sections.length; index++) {
      writeSection(pkg.sections[index]);
    }

    // Write the compiled LVZ buffer to the file.
    fs.writeFileSync(path, buffer);
  }

  static compress(dPkg: LVZPackage): CompressedLVZPackage {
    const pkg = new CompressedLVZPackage(dPkg.name);
    const sections: CompressedLVZSection[] = [];

    // Place the object data on-top of the sections stack.
    pkg.addSection(LVZ.compressObjects(dPkg));
    for (let index = 0; index < dPkg.resources.length; index++) {
      sections.push(dPkg.resources[index].compress());
    }
    // Sort files by fileName.
    sections.sort(((a, b) => {
      return a.fileName.localeCompare(b.fileName);
    }));
    for (let index = 0; index < sections.length; index++) {
      pkg.addSection(sections[index]);
    }
    return pkg;
  }

  static decompress(pkg: CompressedLVZPackage): LVZPackage {
    const dPkg: LVZPackage = new LVZPackage(pkg.name);
    const decompressedSections: DecompressedLVZSection[] = [];
    const count = pkg.getSectionCount();
    for (let index = 0; index < count; index++) {
      decompressedSections[index] = pkg.sections[index].inflate();
    }
    for (let index = 0; index < count; index++) {
      const section = decompressedSections[index];
      if (section.isObjectSection) {
        LVZ.processSection(dPkg, section);
      } else {
        let file = new LVZResource(section.fileName, section.data, section.fileTime);
        dPkg.addResource(file);
      }
    }
    return dPkg;
  }

  private static processSection(dPkg: LVZPackage, section: DecompressedLVZSection): void {
    const buffer = section.data;
    let offset = 0;

    const objHeader = BufferUtils.readFixedString(buffer, offset, 4);
    offset += 4;
    const objCount = buffer.readUInt32LE(offset);
    offset += 4;
    const imgCount = buffer.readUInt32LE(offset);
    offset += 4;

    const readImageObject = (): CompiledLVZImage => {
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
      const animationTime = buffer.readInt16LE(offset);
      offset += 2;
      const xFrames = buffer.readInt16LE(offset);
      offset += 2;
      const yFrames = buffer.readInt16LE(offset);
      offset += 2;
      const fileName = BufferUtils.readNullString(buffer, offset);
      offset += fileName.length + 1;
      /////////////////////////////////////////////
      return new CompiledLVZImage(dPkg, fileName, animationTime, xFrames, yFrames);
    };

    const clv1 = () => {
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
        const first = buffer.readUInt16LE(offset);
        offset += 2;
        const id = first >>> 1;
        const type = (first & 0b0000000000000001) == 1;
        const x = buffer.readInt16LE(offset);
        offset += 2;
        const y = buffer.readInt16LE(offset);
        offset += 2;
        const image = buffer.readUInt8(offset++);
        const layer = buffer.readUInt8(offset++);
        const third = buffer.readUInt16LE(offset);
        offset += 2;
        const time = third & 0x0FFF;
        const mode = (third >> 12) & 0x03FF;
        /////////////////////////////////////////////
        if (type) {
          const mapObject = new CompiledLVZMapObject(dPkg, id, x, y, image, layer, time, mode);
          dPkg.addMapObject(mapObject);
        } else {
          const screenObject = new CompiledLVZScreenObject(dPkg, id, 0, x, 0, y, image, layer, time, mode);
          dPkg.addScreenObject(screenObject);
        }
      }
    };

    const clv2 = () => {
      for (let index = 0; index < objCount; index++) {
        /////////////////////////////////////////////
        //
        // u1	Map Object	If TRUE, this is a Map Object. If FALSE, then is a Screen Object.
        // u15	Object ID	The value for this object ID.
        const first = buffer.readUInt16LE(offset);
        offset += 2;
        const id = first >>> 1;
        const type = (first & 0b0000000000000001) == 1;
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
          const xCoord = buffer.readInt16LE(offset);
          offset += 2;
          const yCoord = buffer.readInt16LE(offset);
          offset += 2;
          const imageNumber = buffer.readUInt8(offset++);
          const layer = buffer.readUInt8(offset++);
          const third = buffer.readUInt16LE(offset);
          offset += 2;
          const displayTime = third & 0x0FFF;
          const mode = (third >> 12) & 0x03FF;
          /////////////////////////////////////////////
          const mapObject = new CompiledLVZMapObject(dPkg, id, xCoord, yCoord, imageNumber, layer, displayTime, mode);
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
          const second = buffer.readUInt16LE(offset);
          offset += 2;
          const third = buffer.readUInt16LE(offset);
          offset += 2;
          const xType = second & 0x0F;
          const x = (second >> 4) - 4096;
          const yType = third & 0x0F;
          const y = (third >> 4) - 4096;
          const image = buffer.readUInt8(offset++);
          const layer = buffer.readUInt8(offset++);
          const fourth = buffer.readUInt16LE(offset);
          offset += 2;
          const time = fourth & 0x0FFF;
          const mode = (fourth >> 12) & 0x03FF;
          /////////////////////////////////////////////
          const screenObject = new CompiledLVZScreenObject(dPkg, id, xType, x, yType, y, image, layer, time, mode);
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
      dPkg.addImage(readImageObject());
    }
  }

  private static compressObjects(dPkg: LVZPackage): CompressedLVZSection {
    const imageCount = dPkg.images.length;
    const mapCount = dPkg.mapObjects.length;
    const screenCount = dPkg.screenObjects.length;
    let imageBytesLength = 12; // Header.
    for (let index = 0; index < imageCount; index++) {
      // i16 + i16 + i16 + NULL-ENDED str = 6 + (str.length + 1)
      imageBytesLength += 6 + (dPkg.images[index].fileName.length + 1);
    }
    // (u1 & u15) + i16 + i16 + u8 + u8 + (u12 & u4) = 10
    const mapBytesLength = mapCount * 10;
    // (u1 & u15) + (u4 & i12) + (u4 & i12) + u8 + u8 + (u12 & u4) = 10
    const screenBytesLength = screenCount * 10;
    const bufferLength = imageBytesLength + mapBytesLength + screenBytesLength;
    const buffer = new Buffer(bufferLength);
    let offset = 0;

    // Header.
    BufferUtils.writeFixedString(buffer, 'CLV2', offset);
    offset += 4;
    buffer.writeUInt32LE(mapCount + screenCount, offset);
    offset += 4;
    buffer.writeUInt32LE(imageCount, offset);
    offset += 4;

    const compressMap = (object: CompiledLVZMapObject) => {
      /////////////////////////////////////////////
      //
      // -> CLV2 MapObject
      //
      // u1	bool        	1
      // u15	Object ID	    The value for this object ID.
      // i16	X 	            The X coordinate. (In pixels)
      // i16	Y 	            The Y coordinate. (In pixels)
      // u8	Image Number	Which of the Image Definitions this object will use for its graphic.
      // u8	Layer	        Which layer it will be displayed on. Values for this later.
      // u12	Display Time	How long will display for, in 1/10th of a second.
      // u4	Display Mode	Which display mode this object uses.
      buffer.writeUInt16LE((object.id << 1) | 1, offset);
      offset += 2;
      buffer.writeInt16LE(object.x, offset);
      offset += 2;
      buffer.writeInt16LE(object.y, offset);
      offset += 2;
      buffer.writeUInt8(object.image, offset++);
      buffer.writeUInt8(object.layer, offset++);
      buffer.writeUInt16LE((object.mode << 12) | object.time, offset);
      offset += 2;
      /////////////////////////////////////////////
    };

    const compressScreen = (object: CompiledLVZScreenObject) => {
      /////////////////////////////////////////////
      //
      // -> CLV2 ScreenObject
      //
      // u1	bool            0
      // u15	Object ID	    The value for this object ID.
      // u4	X Type          The type of screen orientation for the X coordinate.
      // i12	X               The X coordinate. (In pixels)
      // u4	Y Type	        The type of screen orientation for the Y coordinate.
      // i12	Y               The Y coordinate. (In pixels)
      // u8	Image Number	Which of the Image Definitions this object will use for its graphic.
      // u8	Layer	        Which layer it will be displayed on.
      // u12	Display Time	How long will display for, in 1/10th of a second.
      // u4	Display Mode	Which display mode this object uses.
      buffer.writeUInt16LE((object.id << 1) | 0, offset);
      offset += 2;
      buffer.writeUInt16LE((object.x << 4) | object.xType, offset);
      offset += 2;
      buffer.writeUInt16LE((object.y << 4) | object.yType, offset);
      offset += 2;
      buffer.writeUInt8(object.image, offset++);
      buffer.writeUInt8(object.layer, offset++);
      buffer.writeUInt16LE((object.mode << 12) | object.time, offset);
      offset += 2;
      /////////////////////////////////////////////
    };

    const compressImage = (image: CompiledLVZImage) => {
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
      buffer.writeInt16LE(image.xFrames, offset);
      offset += 2;
      buffer.writeInt16LE(image.yFrames, offset);
      offset += 2;
      buffer.writeInt16LE(image.animationTime, offset);
      offset += 2;
      BufferUtils.writeNullString(image.fileName, buffer, offset);
      offset += image.fileName.length + 1;
      /////////////////////////////////////////////
    };

    for (let index = 0; index < mapCount; index++) {
      compressMap(dPkg.mapObjects[index]);
    }
    for (let index = 0; index < screenCount; index++) {
      compressScreen(dPkg.screenObjects[index]);
    }
    for (let index = 0; index < imageCount; index++) {
      compressImage(dPkg.images[index]);
    }

    const decompressSize = buffer.length;
    const compressBuffer = zlib.deflateSync(buffer);
    const compressSize = compressBuffer.length;
    return new CompressedLVZSection(decompressSize, 0, compressSize, '', compressBuffer);
  }

  static loadTexture(resource: LVZResource, callback: (texture: PIXI.Texture) => void): void {
    if (!resource.isImage()) {
      throw new Error(`The LVZResource is not an image file. (${resource.getName()})`);
    }

    const mimeType = resource.getMimeType();
    if (mimeType == null) {
      throw new Error(
        `The LVZResource identifies as an image type, but has no registered mime-type. (${resource.getName()})`
      );
    }

    // Convert image file to base64-encoded string.
    const base64Image = resource.getData().toString('base64');
    let image = document.createElement('img');
    image.src = `data:${mimeType};base64,${base64Image}`;
    image.decode().finally(() => {
      if (image.width === 0 || image.height === 0) {
        console.warn(`image width or height is 0. (width: ${image.width}, height: ${image.height})`);
        image = null;
        return;
      }

      const cv = document.createElement('canvas');
      cv.width = image.width;
      cv.height = image.height;
      const ct = cv.getContext('2d');
      ct.drawImage(image, 0, 0);

      const imgData = ct.getImageData(0, 0, cv.width, cv.height);
      const data = imgData.data;
      for (let offset = 0; offset < data.length; offset += 4) {
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        if (r === 0 && b === 0 && g === 0) {
          data[offset + 3] = 0;
        }
      }

      ct.putImageData(imgData, 0, 0);
      callback(PIXI.Texture.from(cv));
    });
  }

  static validateDecompressedScreenObject(dpkg: LVZPackage, object: CompiledLVZScreenObject): LVZErrorStatus {
    if (object == null) {
      return LVZErrorStatus.OBJECT_NULL;
    } else if (object.image == null) {
      return LVZErrorStatus.IMAGE_NOT_DEFINED;
    } else if (object.image < 0 || object.image > dpkg.images.length - 1) {
      return LVZErrorStatus.IMAGE_INDEX_OUT_OF_RANGE;
    } else if (object.id < LVZ.OBJECT_ID_MIN || object.id > LVZ.OBJECT_ID_MAX) {
      return LVZErrorStatus.OBJECT_ID_OUT_OF_RANGE;
    } else if (object.x < LVZ.SCREEN_OBJECT_COORDINATE_MIN || object.x > LVZ.SCREEN_OBJECT_COORDINATE_MAX) {
      return LVZErrorStatus.X_COORDINATE_OUT_OF_RANGE;
    } else if (object.y < LVZ.SCREEN_OBJECT_COORDINATE_MIN || object.y > LVZ.SCREEN_OBJECT_COORDINATE_MAX) {
      return LVZErrorStatus.Y_COORDINATE_OUT_OF_RANGE;
    } else if (object.xType < LVZ.COORDINATE_TYPE_MIN || object.xType > LVZ.COORDINATE_TYPE_MAX) {
      return LVZErrorStatus.X_COORDINATE_TYPE_OUT_OF_RANGE;
    } else if (object.yType < LVZ.COORDINATE_TYPE_MIN || object.yType > LVZ.COORDINATE_TYPE_MAX) {
      return LVZErrorStatus.Y_COORDINATE_TYPE_OUT_OF_RANGE;
    } else if (object.mode < LVZ.DISPLAY_MODE_MIN || object.mode > LVZ.DISPLAY_MODE_MAX) {
      return LVZErrorStatus.DISPLAY_MODE_OUT_OF_RANGE;
    } else if (object.layer < LVZ.RENDER_LAYER_MIN || object.layer > LVZ.RENDER_LAYER_MAX) {
      return LVZErrorStatus.RENDER_LAYER_OUT_OF_RANGE;
    } else if (object.time < LVZ.DISPLAY_TIME_MIN || object.time > LVZ.DISPLAY_TIME_MAX) {
      return LVZErrorStatus.DISPLAY_TIME_OUT_OF_RANGE;
    }
    return LVZErrorStatus.SUCCESS;
  }

  static validateScreenObject(object: LVZScreenObject): LVZErrorStatus {
    if (object == null) {
      return LVZErrorStatus.OBJECT_NULL;
    } else if (object.getImage() == null) {
      return LVZErrorStatus.IMAGE_NOT_DEFINED;
    } else if (object.getId() < LVZ.OBJECT_ID_MIN || object.getId() > LVZ.OBJECT_ID_MAX) {
      return LVZErrorStatus.OBJECT_ID_OUT_OF_RANGE;
    } else if (object.getX() < LVZ.SCREEN_OBJECT_COORDINATE_MIN
      || object.getX() > LVZ.SCREEN_OBJECT_COORDINATE_MAX) {
      return LVZErrorStatus.X_COORDINATE_OUT_OF_RANGE;
    } else if (object.getY() < LVZ.SCREEN_OBJECT_COORDINATE_MIN
      || object.getY() > LVZ.SCREEN_OBJECT_COORDINATE_MAX) {
      return LVZErrorStatus.Y_COORDINATE_OUT_OF_RANGE;
    } else if (object.getXType() < LVZ.COORDINATE_TYPE_MIN || object.getXType() > LVZ.COORDINATE_TYPE_MAX) {
      return LVZErrorStatus.X_COORDINATE_TYPE_OUT_OF_RANGE;
    } else if (object.getYType() < LVZ.COORDINATE_TYPE_MIN || object.getYType() > LVZ.COORDINATE_TYPE_MAX) {
      return LVZErrorStatus.Y_COORDINATE_TYPE_OUT_OF_RANGE;
    } else if (object.getMode() < LVZ.DISPLAY_MODE_MIN || object.getMode() > LVZ.DISPLAY_MODE_MAX) {
      return LVZErrorStatus.DISPLAY_MODE_OUT_OF_RANGE;
    } else if (object.getLayer() < LVZ.RENDER_LAYER_MIN || object.getLayer() > LVZ.RENDER_LAYER_MAX) {
      return LVZErrorStatus.RENDER_LAYER_OUT_OF_RANGE;
    } else if (object.getDisplayTime() < LVZ.DISPLAY_TIME_MIN || object.getDisplayTime() > LVZ.DISPLAY_TIME_MAX) {
      return LVZErrorStatus.DISPLAY_TIME_OUT_OF_RANGE;
    }
    return LVZErrorStatus.SUCCESS;
  }

  static validateDecompressedMapObject(dpkg: LVZPackage, object: CompiledLVZMapObject): LVZErrorStatus {
    if (object == null) {
      return LVZErrorStatus.OBJECT_NULL;
    } else if (object.image == null) {
      return LVZErrorStatus.IMAGE_NOT_DEFINED;
    } else if (object.image < 0 || object.image > dpkg.images.length - 1) {
      return LVZErrorStatus.IMAGE_INDEX_OUT_OF_RANGE;
    } else if (object.id < LVZ.OBJECT_ID_MIN || object.id > LVZ.OBJECT_ID_MAX) {
      return LVZErrorStatus.OBJECT_ID_OUT_OF_RANGE;
    } else if (object.x < LVZ.MAP_OBJECT_COORDINATE_MIN || object.x > LVZ.MAP_OBJECT_COORDINATE_MAX) {
      return LVZErrorStatus.X_COORDINATE_OUT_OF_RANGE;
    } else if (object.y < LVZ.MAP_OBJECT_COORDINATE_MIN || object.y > LVZ.MAP_OBJECT_COORDINATE_MAX) {
      return LVZErrorStatus.Y_COORDINATE_OUT_OF_RANGE;
    } else if (object.mode < LVZ.DISPLAY_MODE_MIN || object.mode > LVZ.DISPLAY_MODE_MAX) {
      return LVZErrorStatus.DISPLAY_MODE_OUT_OF_RANGE;
    } else if (object.layer < LVZ.RENDER_LAYER_MIN || object.layer > LVZ.RENDER_LAYER_MAX) {
      return LVZErrorStatus.RENDER_LAYER_OUT_OF_RANGE;
    } else if (object.time < LVZ.DISPLAY_TIME_MIN || object.time > LVZ.DISPLAY_TIME_MAX) {
      return LVZErrorStatus.DISPLAY_TIME_OUT_OF_RANGE;
    }
    return LVZErrorStatus.SUCCESS;
  }

  static validateMapObject(object: LVZMapObject): LVZErrorStatus {
    if (object == null) {
      return LVZErrorStatus.OBJECT_NULL;
    } else if (object.image == null) {
      return LVZErrorStatus.IMAGE_NOT_DEFINED;
    } else if (object.id < LVZ.OBJECT_ID_MIN || object.id > LVZ.OBJECT_ID_MAX) {
      return LVZErrorStatus.OBJECT_ID_OUT_OF_RANGE;
    } else if (object.x < LVZ.MAP_OBJECT_COORDINATE_MIN || object.x > LVZ.MAP_OBJECT_COORDINATE_MAX) {
      return LVZErrorStatus.X_COORDINATE_OUT_OF_RANGE;
    } else if (object.y < LVZ.MAP_OBJECT_COORDINATE_MIN || object.y > LVZ.MAP_OBJECT_COORDINATE_MAX) {
      return LVZErrorStatus.Y_COORDINATE_OUT_OF_RANGE;
    } else if (object.mode < LVZ.DISPLAY_MODE_MIN || object.mode > LVZ.DISPLAY_MODE_MAX) {
      return LVZErrorStatus.DISPLAY_MODE_OUT_OF_RANGE;
    } else if (object.layer < LVZ.RENDER_LAYER_MIN || object.layer > LVZ.RENDER_LAYER_MAX) {
      return LVZErrorStatus.RENDER_LAYER_OUT_OF_RANGE;
    } else if (object.time < LVZ.DISPLAY_TIME_MIN || object.time > LVZ.DISPLAY_TIME_MAX) {
      return LVZErrorStatus.DISPLAY_TIME_OUT_OF_RANGE;
    }
    return LVZErrorStatus.SUCCESS;
  }

  static validateCompiledImage(compiledImage: CompiledLVZImage): LVZErrorStatus {
    if (compiledImage == null) {
      return LVZErrorStatus.OBJECT_NULL;
    } else if (compiledImage.fileName == null) {
      return LVZErrorStatus.COMPILED_IMAGE_FILENAME_NULL;
    } else if (compiledImage.fileName == '') {
      return LVZErrorStatus.COMPILED_IMAGE_FILENAME_EMPTY;
    } else if (compiledImage.xFrames < LVZ.IMAGE_FRAME_COUNT_MIN || compiledImage.xFrames > LVZ.IMAGE_FRAME_COUNT_MAX) {
      return LVZErrorStatus.Y_COORDINATE_OUT_OF_RANGE;
    } else if (compiledImage.yFrames < LVZ.IMAGE_FRAME_COUNT_MIN || compiledImage.yFrames > LVZ.IMAGE_FRAME_COUNT_MAX) {
      return LVZErrorStatus.X_COORDINATE_OUT_OF_RANGE;
    } else if (compiledImage.animationTime < LVZ.IMAGE_ANIMATION_TIME_MIN || compiledImage.animationTime > LVZ.IMAGE_ANIMATION_TIME_MAX) {
      return LVZErrorStatus.ANIMATION_TIME_OUT_OF_RANGE;
    }
    return LVZErrorStatus.SUCCESS;
  }

  static validateResource(resource: LVZResource): LVZErrorStatus {
    if (resource == null) {
      return LVZErrorStatus.OBJECT_NULL;
    } else if (resource.getData() == null) {
      return LVZErrorStatus.RESOURCE_DATA_NULL;
    } else if (resource.getName() == null) {
      return LVZErrorStatus.RESOURCE_NAME_NULL;
    } else if (resource.getName() == '') {
      return LVZErrorStatus.RESOURCE_NAME_EMPTY;
    } else if (resource.getTime() < LVZ.RESOURCE_TIME_MIN) {
      return LVZErrorStatus.RESOURCE_TIME_NEGATIVE;
    }
    return LVZErrorStatus.SUCCESS;
  }

  static validateImage(image: LVZImage): LVZErrorStatus {
    if (image == null) {
      return LVZErrorStatus.OBJECT_NULL;
    } else if (image.getResource() == null) {
      return LVZErrorStatus.IMAGE_RESOURCE_NULL;
    } else if (image.getXFrames() < LVZ.IMAGE_FRAME_COUNT_MIN
      || image.getXFrames() > LVZ.IMAGE_FRAME_COUNT_MAX) {
      return LVZErrorStatus.X_FRAME_COUNT_OUT_OF_RANGE;
    } else if (image.getYFrames() < LVZ.IMAGE_FRAME_COUNT_MIN
      || image.getYFrames() > LVZ.IMAGE_FRAME_COUNT_MAX) {
      return LVZErrorStatus.Y_FRAME_COUNT_OUT_OF_RANGE;
    } else if (image.getAnimationTime() < LVZ.IMAGE_ANIMATION_TIME_MIN
      || image.getAnimationTime() > LVZ.IMAGE_ANIMATION_TIME_MAX) {
      return LVZErrorStatus.ANIMATION_TIME_OUT_OF_RANGE;
    }
    return LVZErrorStatus.SUCCESS;
  }
}

/**
 * The <i>LVLErrorStatus</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum LVZErrorStatus {
  // GENERAL
  SUCCESS,
  OBJECT_NULL,
  OBJECT_ID_OUT_OF_RANGE,
  X_COORDINATE_OUT_OF_RANGE,
  Y_COORDINATE_OUT_OF_RANGE,
  X_COORDINATE_TYPE_OUT_OF_RANGE,
  Y_COORDINATE_TYPE_OUT_OF_RANGE,
  ANIMATION_TIME_OUT_OF_RANGE,
  IMAGE_NOT_DEFINED,
  DISPLAY_MODE_OUT_OF_RANGE,
  DISPLAY_TIME_OUT_OF_RANGE,
  RENDER_LAYER_OUT_OF_RANGE,
  X_FRAME_COUNT_OUT_OF_RANGE,
  Y_FRAME_COUNT_OUT_OF_RANGE,
  // COMPILED IMAGE
  COMPILED_IMAGE_FILENAME_NULL,
  COMPILED_IMAGE_FILENAME_EMPTY,
  // COMPILED OBJECTS
  IMAGE_INDEX_OUT_OF_RANGE,
  // IMAGE
  IMAGE_RESOURCE_NULL,
  // RESOURCE
  RESOURCE_DATA_NULL,
  RESOURCE_NAME_NULL,
  RESOURCE_NAME_EMPTY,
  RESOURCE_TIME_NEGATIVE,
}
