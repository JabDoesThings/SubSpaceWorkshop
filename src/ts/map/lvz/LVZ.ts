import { LVZ_IO } from './LVZ_IO';
import { Printable } from '../../util/Printable';
import * as zlib from "zlib";

export class LVZCollection extends Printable {

    private mapObjects: LVZMapObject[];
    private screenObjects: LVZScreenObject[];

    public constructor() {

        super();

        this.mapObjects = [];
        this.screenObjects = [];
    }

    // @Override
    protected onPrint(prefix: string): void {

        console.log(prefix + "LVZ COLLECTION:");

        console.log(prefix + "\tMAP OBJECTS: (" + this.mapObjects.length + ")");
        for (let index = 0; index < this.mapObjects.length; index++) {
            this.mapObjects[index].print(prefix + "\t\t");
        }

        console.log(prefix + "\tSCREEN OBJECTS: (" + this.screenObjects.length + ")");
        for (let index = 0; index < this.screenObjects.length; index++) {
            this.screenObjects[index].print(prefix + "\t\t");
        }
    }

    public addMapObject(object: LVZMapObject) {

        // Make sure the MapObject is not null or undefined.
        if (object == null) {
            throw new Error("The LVZMapObject given is null or undefined.");
        }

        // Check if the MapObject is already registered in the collection.
        if (this.hasMapObject(object)) {

            let message = "The LVZCollection already contains the LVZMapObject.";

            // Print details about the object.
            console.log(message);
            object.print("\t");

            // Formally throw an error.
            throw new Error(message);
        }

        this.mapObjects.push(object);
    }

    /**
     * Unregisters a map object from the LVZ collection.
     *
     * @param object The map object to remove.
     *
     * @throws Error Thrown if the map object given is null, undefined, or is not registered to the package.
     */
    public removeMapObject(object: LVZMapObject): void {

        // Make sure the map object isn't null or undefined.
        if (object == null) {
            throw new Error("The LVZMapObject given is null or undefined.");
        }

        // Make sure that the map object is registered to the package.
        if (!this.hasMapObject(object)) {

            let message = "The LVZCollection does not contain the LVZMapObject.";

            // Print details about the object.
            console.log(message);
            object.print("\t");

            // Formally throw an error.
            throw new Error(message);
        }

        // We must now make a new array to process the old one and remove the map object.
        let newArray: LVZMapObject[] = [];

        // Keep track of the position on the array as it will not always be the same as
        //   the iterated index of the old array.
        let offset: number = 0;

        // Go through all currently registered map objects.
        for (let index = 0; index < this.mapObjects.length; index++) {

            let next = this.mapObjects[index];

            // If the next registered map object explicitly matches the map object to remove,
            //   simply continue without adding. This will offset the index from the
            //   new array's offset.
            if (next === object) {
                continue;
            }

            // If the next registered map object is not the one to remove, simply add it
            //   back to the new array that will replace the old one.
            newArray[offset++] = next;
        }

        // Set the new array as the map objects for the collection.
        this.mapObjects = newArray;
    }

    public addScreenObject(object: LVZScreenObject) {

        // Make sure the screen object is not null or undefined.
        if (object == null) {
            throw new Error("The LVZScreenObject given is null or undefined.");
        }

        // Check if the screen object is already registered in the collection.
        if (this.hasScreenObject(object)) {

            let message = "The LVZCollection already contains the LVZScreenObject.";

            // Print details about the object.
            console.log(message);
            object.print("\t");

            // Formally throw an error.
            throw new Error(message);
        }

        this.screenObjects.push(object);
    }

    /**
     * Unregisters a screen object from the LVZ collection.
     *
     * @param object The screen object to remove.
     *
     * @throws Error Thrown if the screen object given is null, undefined, or is not registered to the package.
     */
    public removeScreenObject(object: LVZScreenObject): void {

        // Make sure the screen object isn't null or undefined.
        if (object == null) {
            throw new Error("The LVZScreenObject given is null or undefined.");
        }

        // Make sure that the screen object is registered to the package.
        if (!this.hasScreenObject(object)) {

            let message = "The LVZCollection does not contain the LVZScreenObject.";

            // Print details about the object.
            console.log(message);
            object.print("\t");

            // Formally throw an error.
            throw new Error(message);
        }

        // We must now make a new array to process the old one and remove the screen object.
        let newArray: LVZScreenObject[] = [];

        // Keep track of the position on the array as it will not always be the same as
        //   the iterated index of the old array.
        let offset: number = 0;

        // Go through all currently registered screen objects.
        for (let index = 0; index < this.screenObjects.length; index++) {

            let next = this.screenObjects[index];

            // If the next registered screen object explicitly matches the screen object to remove,
            //   simply continue without adding. This will offset the index from the
            //   new array's offset.
            if (next === object) {
                continue;
            }

            // If the next registered screen object is not the one to remove, simply add it
            //   back to the new array that will replace the old one.
            newArray[offset++] = next;
        }

        // Set the new array as the screen objects for the collection.
        this.screenObjects = newArray;
    }

    /**
     * Clears all registered map objects in the LVZ collection.
     */
    public clearMapObjects(): void {
        this.mapObjects = [];
    }

    /**
     * Clears all registered screen objects in the LVZ collection.
     */
    public clearScreenObjects(): void {
        this.screenObjects = [];
    }

    /**
     * Clears all registered objects in the LVZ collection.
     */
    public clear(): void {
        this.clearMapObjects();
        this.clearScreenObjects();
    }

    /**
     * Tests if a map object is registered in the package.
     *
     * @param object The map object to test.
     *
     * @return Returns 'true' if the map object is registered in the package.
     */
    public hasMapObject(object: LVZMapObject) {

        // Make sure the map object isn't null or undefined.
        if (object == null) {
            throw new Error("The LVZMapObject given is null or undefined.");
        }

        // Make sure we have registered map objects.
        if (this.mapObjects.length === 0) {
            return false;
        }

        // Go through each registered map object.
        for (let key in this.mapObjects) {

            // If the next map object explicitly matches the map object given,
            //   then the package contains the map object.
            let value = this.mapObjects[key];
            if (value === object) {
                return true;
            }

        }

        // The package does not contain the map object.
        return false;
    }

    /**
     * Tests if a screen object is registered in the package.
     *
     * @param object The screen object to test.
     *
     * @return Returns 'true' if the screen object is registered in the package.
     */
    public hasScreenObject(object: LVZScreenObject) {

        // Make sure the screen object isn't null or undefined.
        if (object == null) {
            throw new Error("The LVZScreenObject given is null or undefined.");
        }

        // Make sure we have registered screen objects.
        if (this.screenObjects.length === 0) {
            return false;
        }

        // Go through each registered screen object.
        for (let key in this.screenObjects) {

            // If the next screen object explicitly matches the screen object given,
            //   then the package contains the screen object.
            let value = this.screenObjects[key];
            if (value === object) {
                return true;
            }

        }

        // The package does not contain the screen object.
        return false;
    }
}

/**
 * The <i>LVZCompressedPackage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZCompressedPackage extends Printable {

    public sections: LVZCompressedSection[];
    public name: string;

    /**
     * Main constructor.
     *
     * @param name The name of the package. (The name of the LVZ file)
     */
    constructor(name: string) {

        super();

        this.name = name;
        this.sections = [];
    }

    // @Override
    protected onPrint(prefix: string): void {

        console.log(prefix + "COMPRESSED PACKAGE:");
        console.log(prefix + "\tNAME: " + this.name);
        console.log(prefix + "\tSECTIONS: (" + this.sections.length + ")");
        for (let index = 0; index < this.sections.length; index++) {
            this.sections[index].print(prefix + "\t\t");
        }
    }

    public deflate(): LVZPackage {
        return LVZ_IO.decompress(this);
    }

    /**
     * Tests whether the compressed section is registered in the package.
     *
     * @param section The section to test.
     *
     * @return Returns 'true' if the section is registered in the package.
     */
    public hasSection(section: LVZCompressedSection): boolean {

        // Make sure we have registered sections first.
        if (this.sections.length === 0) {
            return false;
        }

        // Go through each registered section.
        for (let key in this.sections) {

            // If the next section explicitly matches the section given,
            //   then the package contains the section.
            let value = this.sections[key];
            if (value === section) {
                return true;
            }

        }

        // The package does not contain the section.
        return false;
    }

    /**
     * Registers a section to the compiled package.
     *
     * @param section The section to add.
     *
     * @throws Error Thrown if the section given is null, undefined, or already registered to the package.
     */
    public addSection(section: LVZCompressedSection): void {

        // Make sure the section isn't null or undefined.
        if (section == null) {
            throw new Error("The LVZCompressedSection given is null or undefined.");
        }

        // Make sure that the section isn't already registered to the package.
        if (this.hasSection(section)) {

            // Make sure that Object-Data sections have a label.
            let fileName = section.fileName;
            if (fileName == null || fileName.length === 0) {
                fileName = "[OBJECT DATA SECTION]";
            }

            throw new Error("The LVZCompressedPackage \"" + this.name + "\" already has the LVZCompressedSection \"" + fileName + "\".");
        }

        // Add the section to the next portion of the list.
        this.sections.push(section);
    }

    /**
     * Unregisters a section from the compiled package.
     *
     * @param section The section to remove.
     *
     * @throws Error Thrown if the section given is null, undefined, or is not registered to the package.
     */
    public removeSection(section: LVZCompressedSection): void {

        // Make sure the section isn't null or undefined.
        if (section == null) {
            throw new Error("The LVZCompressedSection given is null or undefined.");
        }

        // Make sure that the section is registered to the package.
        if (!this.hasSection(section)) {

            // Make sure that Object-Data sections have a label.
            let fileName = section.fileName;
            if (fileName == null || fileName.length === 0) {
                fileName = "[OBJECT DATA SECTION]";
            }

            throw new Error("The LVZCompressedPackage \"" + this.name + "\" does not contain the LVZCompressedSection \"" + fileName + "\".");
        }

        // We must now make a new array to process the old one and remove the section.
        let newArray: LVZCompressedSection[] = [];

        // Keep track of the position on the array as it will not always be the same as
        //   the iterated index of the old array.
        let offset: number = 0;

        // Go through all currently registered sections.
        for (let index = 0; index < this.sections.length; index++) {

            let nextSection = this.sections[index];

            // If the next registered section explicitly matches the section to remove,
            //   simply continue without adding. This will offset the index from the
            //   new array's offset.
            if (nextSection === section) {
                continue;
            }

            // If the next registered section is not the one to remove, simply add it
            //   back to the new array that will replace the old one.
            newArray[offset++] = nextSection;
        }

        // Set the new array as the sections for the compressed package.
        this.sections = newArray;
    }

    /**
     * @return Returns all registered sections in the compressed package.
     */
    public getSections(): LVZCompressedSection[] {
        return this.sections;
    }

    /**
     * @return Returns the count of registered sections in the compressed package.
     */
    public getSectionCount(): number {
        return this.sections.length;
    }
}

/**
 * The <i>LVZDecompressedPackage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZPackage extends Printable {

    public files: LVZFile[];
    public images: LVZImage[];
    public mapObjects: LVZCompiledMapObject[];
    public screenObjects: LVZCompiledScreenObject[];

    public name: string;

    /**
     * Main constructor.
     *
     * @param name The name of the package. (The name of the LVZ file)
     */
    public constructor(name: string) {

        super();

        this.name = name;
        this.files = [];
        this.images = [];
        this.mapObjects = [];
        this.screenObjects = [];
    }

    // @Override
    protected onPrint(prefix: string): void {

        console.log(prefix + "LVZ DECOMPRESSED PACKAGE (" + this.name + ")");

        console.log(prefix + "\tFILES: (" + this.files.length + ")");
        for (let index = 0; index < this.files.length; index++) {
            this.files[index].print(prefix + "\t\t");
        }

        console.log(prefix + "\tIMAGES: (" + this.images.length + ")");
        for (let index = 0; index < this.images.length; index++) {
            this.images[index].print(prefix + "\t\t");
        }

        console.log(prefix + "\tMAP OBJECTS: (" + this.mapObjects.length + ")");
        for (let index = 0; index < this.mapObjects.length; index++) {
            this.mapObjects[index].print(prefix + "\t\t");
        }

        console.log(prefix + "\tSCREEN OBJECTS: (" + this.screenObjects.length + ")");
        for (let index = 0; index < this.screenObjects.length; index++) {
            this.screenObjects[index].print(prefix + "\t\t");
        }
    }

    public decompile(): LVZCollection {

        let collection = new LVZCollection();

        for (let index = 0; index < this.mapObjects.length; index++) {

            let next = this.mapObjects[index];

            let image = this.images[next.image];
            let x = next.x;
            let y = next.y;
            let id = next.id;
            let layer = next.layer;
            let mode = next.mode;
            let time = next.time;

            let decompiled = new LVZMapObject(image, x, y, id, layer, mode, time);

            collection.addMapObject(decompiled);
        }

        for (let index = 0; index < this.screenObjects.length; index++) {

            let next = this.screenObjects[index];

            let image = this.images[next.image];
            let x = next.x;
            let y = next.y;
            let id = next.id;
            let time = next.time;
            let layer = next.layer;
            let xType = next.xType;
            let yType = next.yType;
            let mode = next.mode;

            let decompiled = new LVZScreenObject(image, x, y, id, time, layer, xType, yType, mode);

            collection.addScreenObject(decompiled);
        }

        return collection;
    }

    public pack(): LVZCompressedPackage {
        return LVZ_IO.compress(this);
    }

    public addFile(file: LVZFile): void {
        this.files.push(file);
    }

    public addImage(image: LVZImage): void {
        this.images.push(image);
    }

    public addMapObject(object: LVZCompiledMapObject): void {
        this.mapObjects.push(object);
    }

    public addScreenObject(object: LVZCompiledScreenObject): void {
        this.screenObjects.push(object);
    }

}

/**
 * The <i>LVZDecompressedSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZDecompressedSection extends Printable {

    public readonly decompressSize: number;
    public readonly fileTime: number;
    public readonly compressSize: number;
    public readonly fileName: string;
    public readonly data: Buffer;
    public readonly isObjectSection: boolean;

    /**
     * Main constructor.
     *
     * @param decompressSize
     * @param fileTime
     * @param compressSize
     * @param fileName
     * @param data
     */
    constructor(decompressSize: number, fileTime: number, compressSize: number, fileName: string, data: Buffer) {

        super();

        this.decompressSize = decompressSize;
        this.fileTime = fileTime;
        this.compressSize = compressSize;
        this.fileName = fileName;
        this.data = data;
        this.isObjectSection = fileTime == 0;
    }

    // @Override
    protected onPrint(prefix: string): void {

        // Make sure that Object-Data sections have a label.
        let fileName = this.fileName;
        if (fileName == null || fileName.length === 0) {
            fileName = "[OBJECT DATA SECTION]";
        }

        console.log(prefix + "DECOMPRESSED_SECTION: ");
        console.log(prefix + "\tDECOMPRESS_SIZE: " + this.decompressSize);
        console.log(prefix + "\tFILE_TIME: " + this.fileTime);
        console.log(prefix + "\tCOMPRESS_SIZE: " + this.compressSize);
        console.log(prefix + "\tFILE_NAME: " + fileName);
        console.log(prefix + "\tFILE_DATA: " + this.data.length + " byte(s).");
        console.log(prefix + " ");
    }

    /**
     * Compresses the LVZ data section to a writable data block.
     */
    public deflate(): LVZCompressedSection {

        let fileName = this.fileName;
        let fileTime = this.fileTime;
        let decompressSize = this.data.length;
        let compressedData = zlib.deflateSync(this.data);
        let compressSize = compressedData.length;

        return new LVZCompressedSection(decompressSize, fileTime, compressSize, fileName, compressedData);
    }

}

/**
 * The <i>LVZCompressedSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZCompressedSection extends Printable {

    public readonly decompressSize: number;
    public readonly fileTime: number;
    public readonly compressSize: number;
    public readonly fileName: string;
    public readonly data: Buffer;

    /**
     * Main constructor.
     *
     * @param decompressSize
     * @param fileTime
     * @param compressSize
     * @param fileName
     * @param data
     */
    constructor(decompressSize: number, fileTime: number, compressSize: number, fileName: string, data: Buffer) {

        super();

        this.decompressSize = decompressSize;
        this.fileTime = fileTime;
        this.compressSize = compressSize;
        this.fileName = fileName;
        this.data = data;
    }

    // @Override
    protected onPrint(prefix: string): void {

        // Make sure that Object-Data sections have a label.
        let fileName = this.fileName;
        if (fileName == null || fileName.length === 0) {
            fileName = "[OBJECT DATA SECTION]";
        }

        console.log(prefix + "COMPRESSED_SECTION: ");
        console.log(prefix + "\tDECOMPRESS_SIZE: " + this.decompressSize);
        console.log(prefix + "\tFILE_TIME: " + this.fileTime);
        console.log(prefix + "\tCOMPRESS_SIZE: " + this.compressSize);
        console.log(prefix + "\tFILE_NAME: " + fileName);
        console.log(prefix + "\tFILE_DATA: " + this.data.length + " byte(s).");
        console.log(prefix + " ");
    }

    /**
     * Inflates the compressed LVZ data section to parsable data.
     */
    public inflate(): LVZDecompressedSection {
        let zlib = require('zlib');
        let data: Buffer = zlib.inflateSync(this.data);
        return new LVZDecompressedSection(this.decompressSize, this.fileTime, this.compressSize, this.fileName, data);
    }
}

/**
 * The <i>LVZFile</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZFile extends Printable {

    public readonly name: string;
    public readonly time: number;
    public readonly data: Buffer;

    /**
     * Main constructor.
     *
     * @param name
     * @param time
     * @param data
     */
    constructor(name: string, time: number, data: Buffer) {

        super();

        this.name = name;
        this.time = time;
        this.data = data;
    }

    // @Override
    protected onPrint(prefix: string) {
        console.log(prefix + "LVZ FILE");
        console.log(prefix + "\tNAME: " + this.name);
        console.log(prefix + "\tTIME: " + this.time);
        console.log(prefix + "\tDATA: " + this.data.length + " BYTE(S).");
    }
}

/**
 * The <i>LVZImage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZImage extends Printable {

    public fileName: string;
    public animationTime: number;
    public xFrames: number;
    public yFrames: number;

    /**
     * Main constructor.
     *
     * @param fileName
     * @param xFrames
     * @param yFrames
     * @param animationTime
     */
    constructor(fileName: string, xFrames: number = 1, yFrames: number = 1, animationTime: number = 0) {

        super();

        this.fileName = fileName;
        this.animationTime = animationTime;
        this.xFrames = xFrames;
        this.yFrames = yFrames;
    }

    // @Override
    protected onPrint(prefix: string) {
        console.log(prefix + "LVZ IMAGE:");
        console.log(prefix + "\tFILE NAME: " + this.fileName);
        console.log(prefix + "\tX FRAMES: " + this.xFrames);
        console.log(prefix + "\tY FRAMES: " + this.yFrames);
        console.log(prefix + "\tANIMATION TIME: " + this.animationTime);
    }
}

/**
 * The <i>LVZCompiledMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZCompiledMapObject extends Printable {

    public id: number;
    public x: number;
    public y: number;
    public image: number;
    public layer: number;
    public time: number;
    public mode: number;

    /**
     * Main constructor.
     *
     * @param id
     * @param x
     * @param y
     * @param image
     * @param layer
     * @param time
     * @param mode
     */
    constructor(id: number, x: number, y: number, image: number, layer: number, time: number, mode: number) {

        super();

        this.id = id;
        this.x = x;
        this.y = y;
        this.image = image;
        this.layer = layer;
        this.time = time;
        this.mode = mode;
    }

    // @Override
    protected onPrint(prefix: string) {
        console.log(prefix + "MAP OBJECT:");
        console.log(prefix + "\tID: " + this.id);
        console.log(prefix + "\tX: " + this.x);
        console.log(prefix + "\tY: " + this.y);
        console.log(prefix + "\tIMAGE: " + this.image);
        console.log(prefix + "\tLAYER: " + this.layer);
        console.log(prefix + "\tTIME: " + this.time);
        console.log(prefix + "\tMODE: " + this.mode);
    }
}

/**
 * The <i>LVZCompiledScreenObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZCompiledScreenObject extends Printable {

    public id: number;
    public xType: number;
    public x: number;
    public yType: number;
    public y: number;
    public image: number;
    public layer: number;
    public time: number;
    public mode: number;

    /**
     * Main constructor.
     *
     * @param id
     * @param xType
     * @param x
     * @param yType
     * @param y
     * @param image
     * @param layer
     * @param time
     * @param mode
     */
    constructor(
        id: number,
        xType: number,
        x: number,
        yType: number,
        y: number,
        image: number,
        layer: number,
        time: number,
        mode: number) {

        super();

        this.id = id;
        this.xType = xType;
        this.x = x;
        this.yType = yType;
        this.y = y;
        this.image = image;
        this.layer = layer;
        this.time = time;
        this.mode = mode;
    }

    // @Override
    protected onPrint(prefix: string) {
        console.log(prefix + "SCREEN OBJECT:");
        console.log(prefix + "\tID: " + this.id);
        console.log(prefix + "\tX TYPE: " + this.xType);
        console.log(prefix + "\tX: " + this.x);
        console.log(prefix + "\tY TYPE: " + this.yType);
        console.log(prefix + "\tY: " + this.y);
        console.log(prefix + "\tIMAGE: " + this.image);
        console.log(prefix + "\tLAYER: " + this.layer);
        console.log(prefix + "\tTIME: " + this.time);
        console.log(prefix + "\tMODE: " + this.mode);
    }
}

export class LVZMapObject extends Printable {

    private image: LVZImage;
    private x: number;
    private y: number;
    private id: number;
    private layer: LVZRenderLayer;
    private mode: LVZDisplayMode;
    private time: number;

    /**
     * Main constructor.
     *
     * @param image The LVZ image object to display.
     * @param x The X coordinate of the object. (In pixels)
     * @param y The Y coordinate of the object. (In pixels)
     * @param id The display ID of the object.
     * @param layer The layer to render the object. (DEFAULT: AfterTiles)
     * @param mode The display mode for the object. (DEFAULT: ShowAlways)
     * @param time The time to display the object. (DEFAULT: 0. 0 disabled timed display)
     */
    public constructor(
        image: LVZImage,
        x: number,
        y: number,
        id: number = 0,
        layer: LVZRenderLayer = LVZRenderLayer.AfterTiles,
        mode: LVZDisplayMode = LVZDisplayMode.ShowAlways,
        time: number = 0) {

        super();

        this.image = image;
        this.x = x;
        this.y = y;
        this.id = id;
        this.layer = layer;
        this.mode = mode;
        this.time = time;
    }

    // @Override
    protected onPrint(prefix: string): void {

        console.log(prefix + "MAP OBJECT:");
        console.log(prefix + "ID: " + this.id);

        console.log(prefix + "\tIMAGE:");
        this.image.print(prefix + "\t\t");

        console.log(prefix + "\tX: " + this.x);
        console.log(prefix + "\tY: " + this.y);
        console.log(prefix + "\tLAYER: " + this.layer);
        console.log(prefix + "\tMODE: " + this.mode);
        console.log(prefix + "\tTIME: " + this.time);
    }

    /**
     * @return Returns the image displayed for the object.
     */
    public getImage(): LVZImage {
        return this.image;
    }

    /**
     * Sets the image displayed for the object.
     *
     * @param image The image to set.
     */
    public setImage(image: LVZImage): void {
        this.image = image;
    }

    /**
     * @return Returns the X coordinate of the object. (In pixels)
     */
    public getX(): number {
        return this.x;
    }

    /**
     * Sets the X coordinate of the object. (In pixels)
     *
     * @param value The value to set.
     */
    public setX(value: number): void {
        this.x = value;
    }

    /**
     * @return Returns the Y coordinate of the object. (In pixels)
     */
    public getY(): number {
        return this.y;
    }

    /**
     * Sets the Y coordinate of the object. (In pixels)
     *
     * @param value The value to set.
     */
    public setY(value: number): void {
        this.y = value;
    }

    /**
     * @return Returns the assigned ID of the object to use for toggling the 'ServerControlled' LVZDisplayMode.
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Sets the ID of the object to use for toggling the 'ServerControlled' LVZDisplayMode.
     *
     * @param id The ID to set.
     */
    public setId(id: number): void {
        // TODO: Possible check for ID being negative. -Jab
        this.id = id;
    }

    /**
     * @return Returns the assigned layer to render the object.
     */
    public getLayer(): LVZRenderLayer {
        return this.layer;
    }

    /**
     * Sets the layer to render the object.
     *
     * @param layer The layer to set.
     */
    public setLayer(layer: LVZRenderLayer): void {
        this.layer = layer;
    }

    /**
     * @return Returns the display mode for how the object should display.
     */
    public getMode(): LVZDisplayMode {
        return this.mode;
    }

    /**
     * Sets the display mode for how the object should display.
     *
     * @param mode The display mode to set.
     */
    public setMode(mode: LVZDisplayMode): void {
        this.mode = mode;
    }

    /**
     * @return Returns the time that the object will show when toggled on. <br>
     *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
     */
    public getDisplayTime(): number {
        return this.time;
    }

    /**
     * Sets the time that the object will display when toggled on.
     * @param value The display-time to set. <br>
     *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
     */
    public setDisplayTime(value: number): void {
        this.time = value;
    }
}

export class LVZScreenObject extends Printable {

    public image: LVZImage;
    public x: number;
    public y: number;
    public id: number;
    public time: number;
    public layer: LVZRenderLayer;
    public xType: LVZXType;
    public yType: LVZYType;
    public mode: LVZDisplayMode;

    /**
     * Main constructor.
     *
     *
     *
     * @param image The LVZ image object to display.
     * @param x The X coordinate of the object. (In pixels)
     * @param y The Y coordinate of the object. (In pixels)
     * @param id The display ID of the object.
     * @param time The time to display the object. (DEFAULT: 0. 0 disabled timed display)
     * @param layer The layer to render the object. (DEFAULT: AfterTiles)
     * @param xType The x coordinate's origin position on the screen. (DEFAULT: SCREEN_LEFT)
     * @param yType The y coordinate's origin position on the screen. (DEFAULT: SCREEN_TOP)
     * @param mode The display mode for the object. (DEFAULT: ShowAlways)
     */
    public constructor(
        image: LVZImage,
        x: number,
        y: number,
        id: number = 0,
        time: number = 0,
        layer: LVZRenderLayer = LVZRenderLayer.TopMost,
        xType: LVZXType = LVZXType.SCREEN_LEFT,
        yType: LVZYType = LVZYType.SCREEN_TOP,
        mode: LVZDisplayMode = LVZDisplayMode.ShowAlways) {

        super();

        this.image = image;
        this.x = x;
        this.y = y;
        this.id = id;
        this.time = time;
        this.layer = layer;
        this.xType = xType;
        this.yType = yType;
        this.mode = mode;
    }

    // @Override
    protected onPrint(prefix: string): void {

        console.log(prefix + "SCREEN OBJECT:");
        console.log(prefix + "ID: " + this.id);

        console.log(prefix + "\tIMAGE:");
        this.image.print(prefix + "\t\t");

        console.log(prefix + "\tX: " + this.x + " TYPE: " + this.xType);
        console.log(prefix + "\tY: " + this.y + " TYPE: " + this.yType);
        console.log(prefix + "\tLAYER: " + this.layer);
        console.log(prefix + "\tMODE: " + this.mode);
        console.log(prefix + "\tTIME: " + this.time);
    }

    /**
     * @return Returns the image displayed for the object.
     */
    public getImage(): LVZImage {
        return this.image;
    }

    /**
     * Sets the image displayed for the object.
     *
     * @param image The image to set.
     */
    public setImage(image: LVZImage): void {
        this.image = image;
    }

    /**
     * @return Returns the X coordinate of the object. (In pixels)
     */
    public getX(): number {
        return this.x;
    }

    /**
     * Sets the X coordinate of the object. (In pixels)
     *
     * @param value The value to set.
     */
    public setX(value: number): void {
        this.x = value;
    }

    /**
     * @return Returns the Y coordinate of the object. (In pixels)
     */
    public getY(): number {
        return this.y;
    }

    /**
     * Sets the Y coordinate of the object. (In pixels)
     *
     * @param value The value to set.
     */
    public setY(value: number): void {
        this.y = value;
    }

    /**
     * @return Returns the assigned ID of the object to use for toggling the 'ServerControlled' LVZDisplayMode.
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Sets the ID of the object to use for toggling the 'ServerControlled' LVZDisplayMode.
     *
     * @param id The ID to set.
     */
    public setId(id: number): void {
        // TODO: Possible check for ID being negative. -Jab
        this.id = id;
    }

    /**
     * @return Returns the assigned layer to render the object.
     */
    public getLayer(): LVZRenderLayer {
        return this.layer;
    }

    /**
     * Sets the layer to render the object.
     *
     * @param layer The layer to set.
     */
    public setLayer(layer: LVZRenderLayer): void {
        this.layer = layer;
    }

    /**
     * @return Returns the display mode for how the object should display.
     */
    public getMode(): LVZDisplayMode {
        return this.mode;
    }

    /**
     * Sets the display mode for how the object should display.
     *
     * @param mode The display mode to set.
     */
    public setMode(mode: LVZDisplayMode): void {
        this.mode = mode;
    }

    /**
     * @return Returns the time that the object will show when toggled on. <br>
     *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
     */
    public getDisplayTime(): number {
        return this.time;
    }

    /**
     * Sets the time that the object will display when toggled on.
     * @param value The display-time to set. <br>
     *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
     */
    public setDisplayTime(value: number): void {
        this.time = value;
    }

    /**
     * @return Returns the X-coordinate-origin on the screen the object's X coordinate will offset.
     */
    public getXType(): LVZXType {
        return this.xType;
    }

    /**
     * Sets the X-coordinate-origin on the screen that the object's X coordinate will offset.
     *
     * @param type The type to set.
     */
    public setXType(type: LVZXType): void {
        this.xType = type;
    }

    /**
     * @return Returns the Y-coordinate-origin on the screen the object's Y coordinate will offset.
     */
    public getYType(): LVZYType {
        return this.yType;
    }

    /**
     * Sets the Y-coordinate-origin on the screen that the object's Y coordinate will offset.
     *
     * @param type The type to set.
     */
    public setYType(type: LVZYType): void {
        this.yType = type;
    }
}

/**
 * The <i>LVZRenderLayer</i> enum. TODO: Document.
 *
 * <ul>
 *      <li> 0 = BelowAll
 *      <li> 1 = AfterBackground
 *      <li> 2 = AfterTiles
 *      <li> 3 = AfterWeapons
 *      <li> 4 = AfterShips
 *      <li> 5 = AfterGauges
 *      <li> 6 = AfterChat
 *      <li> 7 = TopMost
 * </ul>
 *
 * @author Jab
 */
export enum LVZRenderLayer {
    BelowAll = 0,
    AfterBackground = 1,
    AfterTiles = 2,
    AfterWeapons = 3,
    AfterShips = 4,
    AfterGauges = 5,
    AfterChat = 6,
    TopMost = 7
}

/**
 * The <i>LVZDisplayMode</i> class. TODO: Document.
 *
 * <ul>
 *      <li> 0 = ShowAlways
 *      <li> 1 = EnterZone
 *      <li> 2 = EnterArena
 *      <li> 3 = Kill
 *      <li> 4 = Death
 *      <li> 5 = ServerControlled
 * </ul>
 *
 * @author Jab
 */
export enum LVZDisplayMode {
    ShowAlways = 0,
    EnterZone = 1,
    EnterArena = 2,
    Kill = 3,
    Death = 4,
    ServerControlled = 5
}

/**
 * The <i>LVZXType</i> enum. TODO: Document.
 *
 * <ul>
 *      <li> 0 = Normal (no letters in front)
 *      <li> 1 = Screen center
 *      <li> 2 = Bottom right corner
 *      <li> 3 = Stats box, lower right corner
 *      <li> 4 = Top right corner of specials
 *      <li> 5 = Bottom right corner of specials
 *      <li> 6 = Below energy bar & spec data
 *      <li> 7 = Top left corner of chat
 *      <li> 8 = Top left corner of radar
 *      <li> 9 = Top left corner of radar's text (clock/location)
 *      <li> 10 = Top left corner of weapons
 *      <li> 11 = Bottom left corner of weapons
 * </ul>
 *
 * @author Jab
 */
export enum LVZXType {
    SCREEN_LEFT = 0,
    SCREEN_CENTER = 1,
    SCREEN_RIGHT = 2,
    STATS_BOX_RIGHT_EDGE = 3,
    SPECIALS_RIGHT = 4,
    SPECIALS_RIGHT_2 = 5,
    ENERGY_BAR_CENTER = 6,
    CHAT_TEXT_RIGHT_EDGE = 7,
    RADAR_LEFT_EDGE = 8,
    CLOCK_LEFT_EDGE = 9,
    WEAPONS_LEFT = 10,
    WEAPONS_LEFT_2 = 11
}

/**
 * The <i>LVZYType</i> enum. TODO: Document.
 *
 * <ul>
 *      <li> 0 = Normal (no letters in front)
 *      <li> 1 = Screen center
 *      <li> 2 = Bottom right corner
 *      <li> 3 = Stats box, lower right corner
 *      <li> 4 = Top right corner of specials
 *      <li> 5 = Bottom right corner of specials
 *      <li> 6 = Below energy bar & spec data
 *      <li> 7 = Top left corner of chat
 *      <li> 8 = Top left corner of radar
 *      <li> 9 = Top left corner of radar's text (clock/location)
 *      <li> 10 = Top left corner of weapons
 *      <li> 11 = Bottom left corner of weapons
 * </ul>
 *
 * @author Jab
 */
export enum LVZYType {
    SCREEN_TOP = 0,
    SCREEN_CENTER = 1,
    SCREEN_BOTTOM = 2,
    STATS_BOX_BOTTOM_EDGE = 3,
    SPECIALS_TOP = 4,
    SPECIALS_BOTTOM = 5,
    BOTTOM_ENERGY_BAR = 6,
    CHAT_TOP = 7,
    RADAR_TOP = 8,
    CLOCK_TOP = 9,
    WEAPONS_TOP = 10,
    WEAPONS_BOTTOM = 11
}
