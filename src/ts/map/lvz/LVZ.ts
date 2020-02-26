import { LVZ, LVZErrorStatus } from './LVZUtils';
import { Printable } from '../../util/Printable';
import * as zlib from "zlib";
import { Validatable } from '../../util/Validatable';
import * as fs from 'fs';
import { Dirtable } from '../../util/Dirtable';
import { MapSprite } from '../render/MapSprite';
import { LVL } from '../lvl/LVLUtils';
import ImageResource = PIXI.resources.ImageResource;

/**
 * The <i>LVZCollection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZCollection extends Printable implements Dirtable, Validatable {

    private mapObjects: LVZMapObject[];
    private screenObjects: LVZScreenObject[];
    private dirty: boolean;

    public constructor() {

        super();

        this.mapObjects = [];
        this.screenObjects = [];
        this.dirty = true;
    }

    public getNearbyPixels(x1: number = 0, y1: number = 0, x2: number = 16384, y2: number = 16384): LVZMapObject[] {

        let result: LVZMapObject[] = [];

        for (let index = 0; index < this.mapObjects.length; index++) {

            let next = this.mapObjects[index];
            let x = next.getX(), y = next.getX();

            if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
                result.push(next);
            }
        }

        return result;

        // return this.mapObjects;
    }

    public getNearbyTiles(x1: number = 0, y1: number = 0, x2: number = 1024, y2: number = 1024): LVZMapObject[] {
        return this.getNearbyPixels(x1 * 16, y1 * 16, x2 * 16, y2 * 16);
    }

    public getMapObjects(): LVZMapObject[] {
        return this.mapObjects;
    }

    public getScreenObjects(): LVZScreenObject[] {
        return this.screenObjects;
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

    // @Override
    public validate(): void {

        // Validate all Map Objects.
        for (let key in this.mapObjects) {
            let value = this.mapObjects[key];
            value.validate();
        }

        // Validate all Screen Objects.
        for (let key in this.screenObjects) {
            let value = this.screenObjects[key];
            value.validate();
        }
    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
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
        this.setDirty(true);
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
        this.setDirty(true);
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
        this.setDirty(true);
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
        this.setDirty(true);
    }

    /**
     * Clears all registered map objects in the LVZ collection.
     */
    public clearMapObjects(): void {
        this.mapObjects = [];
        this.setDirty(true);
    }

    /**
     * Clears all registered screen objects in the LVZ collection.
     */
    public clearScreenObjects(): void {
        this.screenObjects = [];
        this.setDirty(true);
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
 * The <i>LVZPackage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZPackage extends Printable implements Validatable {

    public resources: LVZResource[];
    public images: CompiledLVZImage[];
    public mapObjects: CompiledLVZMapObject[];
    public screenObjects: CompiledLVZScreenObject[];

    public name: string;

    /**
     * Main constructor.
     *
     * @param name The name of the package. (The name of the LVZ file)
     */
    public constructor(name: string) {

        super();

        this.name = name;
        this.resources = [];
        this.images = [];
        this.mapObjects = [];
        this.screenObjects = [];
    }

    // @Override
    protected onPrint(prefix: string): void {

        console.log(prefix + "LVZ DECOMPRESSED PACKAGE (" + this.name + ")");

        console.log(prefix + "\tFILES: (" + this.resources.length + ")");
        for (let index = 0; index < this.resources.length; index++) {
            this.resources[index].print(prefix + "\t\t");
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

    // @Override
    public validate(): void {

        for (let index = 0; index < this.resources.length; index++) {
            this.resources[index].validate();
        }

        for (let index = 0; index < this.images.length; index++) {
            this.images[index].validate();
        }

        for (let index = 0; index < this.mapObjects.length; index++) {
            this.mapObjects[index].validate(this);
        }

        for (let index = 0; index < this.screenObjects.length; index++) {
            this.screenObjects[index].validate(this);
        }
    }

    public collect(): LVZCollection {

        let collection = new LVZCollection();

        let unpackedImages: LVZImage[] = [];

        let getResourceByName = (name: string): LVZResource => {
            for (let index = 0; index < this.resources.length; index++) {
                if (this.resources[index].getName() === name) {
                    return this.resources[index];
                }
            }
            return null;
        };

        let unpackImage = (compiledImage: CompiledLVZImage): LVZImage => {
            let resource = getResourceByName(compiledImage.fileName);
            return new LVZImage(resource, compiledImage.xFrames, compiledImage.yFrames, compiledImage.animationTime);
        };

        for (let index = 0; index < this.images.length; index++) {
            unpackedImages.push(unpackImage(this.images[index]));
        }

        for (let index = 0; index < this.mapObjects.length; index++) {

            let next = this.mapObjects[index];

            let image = unpackedImages[next.image];
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

            let image = unpackedImages[next.image];
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

    apply(collection: LVZCollection): void {

        collection.validate();

        let processResource = (resource: LVZResource): void => {
            for (let index = 0; index < this.resources.length; index++) {
                if (this.resources[index].equals(resource)) {
                    return;
                }
            }
            this.resources.push(resource);
        };

        let compileImage = (image: LVZImage): CompiledLVZImage => {
            processResource(image.getResource());
            return new CompiledLVZImage(
                image.getResource().getName(),
                image.getXFrames(),
                image.getYFrames(),
                image.getAnimationTime()
            );
        };

        let getImageIndex = (image: LVZImage): number => {
            let resultIndex = -1;
            for (let index = 0; index < this.images.length; index++) {
                if (this.images[index].equals(image)) {
                    resultIndex = index;
                    break;
                }
            }
            if (resultIndex == -1) {
                resultIndex = this.images.length;
                this.images.push(compileImage(image));
            }
            return resultIndex;
        };

        let mapObjects = collection.getMapObjects();
        let screenObjects = collection.getScreenObjects();

        for (let index = 0; index < mapObjects.length; index++) {
            let next = mapObjects[index];
            let image = getImageIndex(next.image);

            let compiledMapObject = new CompiledLVZMapObject(
                next.id,
                next.x,
                next.y,
                image,
                next.layer,
                next.time,
                next.mode
            );

            this.mapObjects.push(compiledMapObject);
        }

        for (let index = 0; index < screenObjects.length; index++) {
            let next = screenObjects[index];
            let image = getImageIndex(next.getImage());

            let compiledScreenObject = new CompiledLVZScreenObject(
                next.getId(),
                next.getXType(),
                next.getX(),
                next.getYType(),
                next.getY(),
                image,
                next.getLayer(),
                next.getDisplayTime(),
                next.getMode()
            );

            this.screenObjects.push(compiledScreenObject);
        }
    }

    public pack(): CompressedLVZPackage {
        return LVZ.compress(this);
    }

    public addResource(file: LVZResource): void {
        this.resources.push(file);
    }

    public addImage(image: CompiledLVZImage): void {
        this.images.push(image);
    }

    public addMapObject(object: CompiledLVZMapObject): void {
        this.mapObjects.push(object);
    }

    public addScreenObject(object: CompiledLVZScreenObject): void {
        this.screenObjects.push(object);
    }

    public getMapObjects(): CompiledLVZMapObject[] {
        return this.mapObjects;
    }

    public getScreenObjects(): CompiledLVZScreenObject[] {
        return this.screenObjects;
    }
}

/**
 * The <i>CompressedLVZPackage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompressedLVZPackage extends Printable {

    public sections: CompressedLVZSection[];
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

    public inflate(): LVZPackage {
        return LVZ.decompress(this);
    }

    /**
     * Tests whether the compressed section is registered in the package.
     *
     * @param section The section to test.
     *
     * @return Returns 'true' if the section is registered in the package.
     */
    public hasSection(section: CompressedLVZSection): boolean {

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
    public addSection(section: CompressedLVZSection): void {

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
    public removeSection(section: CompressedLVZSection): void {

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
        let newArray: CompressedLVZSection[] = [];

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
    public getSections(): CompressedLVZSection[] {
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
 * The <i>CompressedLVZSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompressedLVZSection extends Printable {

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
    public inflate(): DecompressedLVZSection {
        let zlib = require('zlib');
        let data: Buffer = zlib.inflateSync(this.data);
        return new DecompressedLVZSection(this.decompressSize, this.fileTime, this.compressSize, this.fileName, data);
    }
}

/**
 * The <i>DecompressedLVZSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class DecompressedLVZSection extends Printable {

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
    public deflate(): CompressedLVZSection {

        let fileName = this.fileName;
        let fileTime = this.fileTime;
        let decompressSize = this.data.length;
        let compressedData = zlib.deflateSync(this.data);
        let compressSize = compressedData.length;

        return new CompressedLVZSection(decompressSize, fileTime, compressSize, fileName, compressedData);
    }

}

/**
 * The <i>LVZResource</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZResource extends Printable implements Validatable, Dirtable {

    private data: Buffer;
    private name: string;
    private time: number;
    private dirty: boolean;
    image: HTMLImageElement;

    /**
     * Main constructor.
     *
     * @param nameOrPath
     * @param time
     * @param data
     */
    constructor(nameOrPath: string, data: Buffer = null, time: number = null) {

        super();

        // If the data is not defined, assume the name is actually a file path to read.
        if (data == null) {

            // Make sure the file exists before loading it.
            if (!fs.existsSync(nameOrPath)) {
                throw new Error("The file does not exist: " + nameOrPath);
            }

            // Attempt to read the file.
            this.data = fs.readFileSync(nameOrPath);

            // Allow for overriding file time.
            if (time == null) {
                time = fs.statSync(nameOrPath).mtime.getUTCMilliseconds();
            }

        }
        // If the data is defined, then the name is a name and data is the file data to set.
        else {
            this.name = nameOrPath;
            this.data = data;
        }

        if (time != null) {
            this.time = time;
        } else {
            // Ensure that the file time is set.
            this.time = Date.now();
        }

        this.dirty = true;
    }

    // @Override
    public toString(): string {
        return "LVZResource={"
            + "name=" + this.name
            + ", time=" + this.time
            + ", data=Buffer (" + this.data.length + " bytes)"
            + "}";
    }

    // @Override
    protected onPrint(prefix: string) {
        console.log(prefix + "LVZ FILE");
        console.log(prefix + "\tNAME: " + this.name);
        console.log(prefix + "\tTIME: " + this.time);
        console.log(prefix + "\tDATA: " + this.data.length + " BYTE(S).");
    }

    // @Override
    public validate(): void {

        let status = LVZ.validateResource(this);

        if (status == LVZErrorStatus.SUCCESS) {
            return;
        }

        let message = "Error Code: " + status;
        if (status == LVZErrorStatus.RESOURCE_DATA_NULL) {
            message = "The LVZResource does not have a data buffer.";
        } else if (status == LVZErrorStatus.RESOURCE_NAME_NULL) {
            message = "The LVZResource name is null or undefined.";
        } else if (status == LVZErrorStatus.RESOURCE_NAME_EMPTY) {
            message = "The LVZResource name is empty.";
        } else if (status == LVZErrorStatus.RESOURCE_TIME_NEGATIVE) {
            message = "The LVZResource timestamp is negative.";
        }

        console.log(message);
        this.print("\t");
        throw new EvalError(message);
    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    public compress(): CompressedLVZSection {
        let compressedData = zlib.deflateSync(this.data);
        let compressSize = compressedData.length;
        return new CompressedLVZSection(this.data.length, this.time, compressSize, this.name, compressedData);
    }

    public equals(other: any): boolean {

        if (other instanceof LVZResource) {
            return other.data === this.data
                && other.name === this.name
                && other.time === this.time;
        }

        return false;
    }

    public getData(): Buffer {
        return this.data;
    }

    public setData(data: Buffer): void {
        if (!data.equals(this.data)) {
            this.data = data;
            this.setDirty(true);
        }
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        if (this.name !== name) {
            this.name = name;
            this.setDirty(true);
        }
    }

    public getTime(): number {
        return this.time;
    }

    public setTime(time: number): void {
        if (this.time !== time) {
            this.time = time;
            this.setDirty(true);
        }
    }

    isImage(): boolean {

        let acceptedFormats = ["bm2", "bmp", "png", "gif", "jpg"];

        let extension = this.getExtension();

        for (let index = 0; index < acceptedFormats.length; index++) {
            if (extension === acceptedFormats[index]) {
                return true;
            }
        }

        return false;
    }

    getExtension(): string {

        if (this.name.indexOf(".") != -1) {
            return this.name.toLowerCase().split(".")[1].trim();
        }

        return null;
    }

    private getMimeType() {

        let extension = this.getExtension();

        switch (extension) {
            case "bm2":
            case "bmp":
                return "image/bmp";
            case "gif":
                return "image/gif";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
        }

        return null;
    }

    createTexture(callback: (img: HTMLImageElement) => void): PIXI.Texture {

        if (!this.isImage()) {
            throw new Error("The LVZResource is not an image file. (" + this.name + ")");
        }

        let mimeType = this.getMimeType();

        if (mimeType == null) {
            throw new Error(
                "The LVZResource identifies as an image type, "
                + "but has no registered mime-type. ("
                + this.name
                + ")"
            );
        }

        //convert image file to base64-encoded string
        let base64Image = this.data.toString('base64');

        let cv = document.createElement("canvas");
        let texture = PIXI.Texture.from(cv);

        this.image = document.createElement("img");
        this.image.src = 'data:' + mimeType + ';base64,' + base64Image;
        this.image.decode().finally(() => {
            callback(this.image);
        });

        return texture;
    }
}

/**
 * The <i>CompiledLVZImage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompiledLVZImage extends Printable {

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

    public validate(): void {

        let status = LVZ.validateCompiledImage(this);

        if (status == LVZErrorStatus.SUCCESS) {
            return;
        }

        let message = "Error Code: " + status;
        console.log(message);
        this.print("\t");
        throw new EvalError(message);
    }

    equals(other: any) {

        if (other instanceof LVZImage) {

            return other.getResource().getName() == this.fileName
                && other.getXFrames() == this.xFrames
                && other.getYFrames() == this.yFrames
                && other.getAnimationTime() == this.animationTime;

        } else if (other instanceof CompiledLVZImage) {

            return other.fileName == this.fileName
                && other.xFrames == this.xFrames
                && other.yFrames == this.yFrames
                && other.animationTime == this.animationTime;

        }

        return false;
    }
}

/**
 * The <i>LVZImage</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZImage extends Printable implements Validatable, Dirtable {

    private resource: LVZResource;
    private animationTime: number;
    private xFrames: number;
    private yFrames: number;
    private dirty: boolean;

    private sprite: MapSprite;

    /**
     * Main constructor.
     *
     * @param file
     * @param xFrames
     * @param yFrames
     * @param animationTime
     */
    constructor(file: LVZResource, xFrames: number = 1, yFrames: number = 1, animationTime: number = 0) {

        super();

        this.resource = file;
        this.animationTime = animationTime;
        this.xFrames = xFrames;
        this.yFrames = yFrames;

        this.dirty = true;
    }

    // @Override
    public toString(): string {
        return "LVZImage={"
            + this.resource.toString()
            + ", xFrames=" + this.xFrames
            + ", yFrames=" + this.yFrames
            + ", animationTime=" + this.animationTime
            + "}";
    }

    // @Override
    protected onPrint(prefix: string) {
        console.log(prefix + "LVZ IMAGE:");
        console.log(prefix + "\tFILE NAME: " + this.resource);
        console.log(prefix + "\tX FRAMES: " + this.xFrames);
        console.log(prefix + "\tY FRAMES: " + this.yFrames);
        console.log(prefix + "\tANIMATION TIME: " + this.animationTime);
    }

    // @Override
    public validate(): void {

        let status = LVZ.validateImage(this);

        if (status == LVZErrorStatus.SUCCESS) {
            return;
        }

        let message;
        if (status == LVZErrorStatus.IMAGE_RESOURCE_NULL) {
            message = "The LVZImage resource is null.";
        } else if (status == LVZErrorStatus.ANIMATION_TIME_OUT_OF_RANGE) {
            message =
                "The LVZImage animationTime is out of range. The range is between "
                + LVZ.IMAGE_ANIMATION_TIME_MIN
                + " and "
                + LVZ.IMAGE_ANIMATION_TIME_MAX
                + ".";
        } else if (status == LVZErrorStatus.X_FRAME_COUNT_OUT_OF_RANGE) {
            message = "The LVZImage xFrames is out of range. The range is between "
                + LVZ.IMAGE_FRAME_COUNT_MIN
                + " and "
                + LVZ.IMAGE_FRAME_COUNT_MAX
                + ". (Value is "
                + this.xFrames
                + ")";
        } else if (status == LVZErrorStatus.Y_FRAME_COUNT_OUT_OF_RANGE) {
            message = "The LVZImage yFrames is out of range. The range is between "
                + LVZ.IMAGE_FRAME_COUNT_MIN
                + " and "
                + LVZ.IMAGE_FRAME_COUNT_MAX
                + ". (Value is "
                + this.yFrames
                + ")";
        }

        console.log(message);
        this.print("\t");
        throw new EvalError(message);

    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    getResource(): LVZResource {
        return this.resource;
    }

    setResource(resource: LVZResource): void {

        if (this.resource !== resource) {
            this.resource = resource;

            // The resource changed. The texture is now invalid and needs to be destroyed.
            this.sprite.texture.destroy(true);
            this.sprite = null;

            this.setDirty(true);
        }
    }

    getAnimationTime(): number {
        return this.animationTime;
    }

    setAnimationTime(time: number): void {

        if (this.animationTime !== time) {

            this.animationTime = time;

            // TODO: Apply to sprite if exists.

            this.setDirty(true);
        }
    }

    getXFrames(): number {
        return this.xFrames;
    }

    setXFrames(frames: number): void {

        if (this.xFrames !== frames) {

            this.xFrames = frames;

            // TODO: Apply to sprite if exists.

            this.setDirty(true);
        }
    }

    getYFrames(): number {
        return this.yFrames;
    }

    setYFrames(frames: number): void {

        if (this.yFrames !== frames) {

            this.yFrames = frames;

            // TODO: Apply to sprite if exists.

            this.setDirty(true);
        }
    }

    getSprite(): MapSprite {

        if (this.sprite == null && this.resource.isImage()) {

            let xFrames = this.xFrames, yFrames = this.yFrames;
            let time = this.animationTime / 10;

            this.sprite = new MapSprite(0, 0, xFrames, yFrames, time);

            this.resource.createTexture((img: HTMLImageElement) => {

                let tex = PIXI.Texture.from(img);
                let sequence: PIXI.Texture[] = [];

                let width = img.width;
                let height = img.height;
                let fw = Math.floor(width / xFrames);
                let fh = Math.floor(height / yFrames);

                for (let y = 0; y < this.yFrames; y++) {
                    for (let x = 0; x < this.xFrames; x++) {
                        let frame = new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(x * fw, y * fh, fw, fh));
                        sequence.push(frame);
                    }
                }

                console.log(sequence);

                this.sprite.sequence = sequence;
                this.sprite.frameWidth = img.width / this.xFrames;
                this.sprite.frameHeight = img.height / this.yFrames;

                this.sprite.reset();
            });
        }

        return this.sprite;
    }

    isAnimated(): boolean {
        return this.xFrames > 1 || this.yFrames > 1;
    }
}

/**
 * The <i>CompiledLVZMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompiledLVZMapObject extends Printable {

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

    public validate(dpkg: LVZPackage): void {

        let status = LVZ.validateDecompressedMapObject(dpkg, this);

        if (status == LVZErrorStatus.SUCCESS) {
            return;
        }

        let message = "Error Code: " + status;

        console.log(message);
        this.print("\t");
        throw new EvalError(message);
    }
}

/**
 * The <i>LVZMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZMapObject extends Printable implements Validatable, Dirtable {

    public image: LVZImage;
    public x: number;
    public y: number;
    public id: number;
    public layer: LVZRenderLayer;
    public mode: LVZDisplayMode;
    public time: number;
    public dirty: boolean;

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
        this.dirty = true;
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

    // @Override
    public validate(): void {

        let state = LVZ.validateMapObject(this);

        if (state == LVZErrorStatus.SUCCESS) {
            return;
        }

        let message = null;

        if (state == LVZErrorStatus.IMAGE_NOT_DEFINED) {
            message = "The LVZMapObject does not have a image.";
        } else if (state == LVZErrorStatus.OBJECT_ID_OUT_OF_RANGE) {
            message = "The LVZMapObject's Object ID is out of range."
                + " Object IDs can be between "
                + LVZ.OBJECT_ID_MIN
                + " and "
                + LVZ.OBJECT_ID_MAX
                + ". (" + this.id + " given)";
        } else if (state == LVZErrorStatus.X_COORDINATE_OUT_OF_RANGE) {
            message = "The LVZMapObject X coordinate is out of range."
                + " Coordinates can be between "
                + LVZ.MAP_OBJECT_COORDINATE_MIN
                + " and "
                + LVZ.MAP_OBJECT_COORDINATE_MAX
                + ". (" + this.x + " given)";
        } else if (state == LVZErrorStatus.Y_COORDINATE_OUT_OF_RANGE) {
            message = "The LVZMapObject Y coordinate is out of range."
                + " Coordinates can be between "
                + LVZ.MAP_OBJECT_COORDINATE_MIN
                + " and "
                + LVZ.MAP_OBJECT_COORDINATE_MAX
                + ". (" + this.y + " given)";
        } else if (state == LVZErrorStatus.DISPLAY_MODE_OUT_OF_RANGE) {
            message = "The LVZMapObject's 'display mode' is out of range."
                + " Display modes can be between "
                + LVZ.DISPLAY_MODE_MIN
                + " and "
                + LVZ.DISPLAY_MODE_MAX
                + ". (" + this.mode + " given)";
        } else if (state == LVZErrorStatus.RENDER_LAYER_OUT_OF_RANGE) {
            message = "The LVZMapObject's 'render mode' is out of range."
                + " Render layers can be between "
                + LVZ.RENDER_LAYER_MIN
                + " and "
                + LVZ.RENDER_LAYER_MAX
                + ". (" + this.layer + " given)";
        } else if (state == LVZErrorStatus.DISPLAY_TIME_OUT_OF_RANGE) {
            message = "The LVZMapObject's 'display time' is out of range."
                + " Display times can be between "
                + LVZ.DISPLAY_TIME_MIN
                + " and "
                + LVZ.DISPLAY_TIME_MAX
                + ". (" + this.time + " given)";
        }

        console.warn(message);
        this.print("\t");
        throw new Error(message);
    }

    // @Override
    isDirty(): boolean {
        if (this.dirty) {
            return true;
        }

        if (this.image != null && this.image.isDirty()) {
            return true;
        }
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = false;
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
        if (this.image !== image) {
            this.image = image;
            this.setDirty(true);
        }
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
        if (this.x !== value) {
            this.x = value;
            this.setDirty(true);
        }
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
        if (this.y !== value) {
            this.y = value;
            this.setDirty(true);
        }
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
        if (this.id !== id) {
            this.id = id;
            this.setDirty(true);
        }
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
        if (this.layer !== layer) {
            this.layer = layer;
            this.setDirty(true);
        }

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
        if (this.mode !== mode) {
            this.mode = mode;
            this.setDirty(true);
        }
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
     * @param time The display-time to set. <br>
     *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
     */
    public setDisplayTime(time: number): void {
        if (this.time !== time) {
            this.time = time;
            this.setDirty(true);
        }
    }
}

/**
 * The <i>CompiledLVZScreenObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class CompiledLVZScreenObject extends Printable {

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

    public validate(dpkg: LVZPackage): void {

        let status = LVZ.validateDecompressedScreenObject(dpkg, this);

        if (status == LVZErrorStatus.SUCCESS) {
            return;
        }

        let message = "Error Code: " + status;

        console.log(message);
        this.print("\t");
        throw new EvalError(message);

    }
}

/**
 * The <i>LVZScreenObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZScreenObject extends Printable implements Validatable, Dirtable {

    private image: LVZImage;
    private x: number;
    private y: number;
    private id: number;
    private time: number;
    private layer: LVZRenderLayer;
    private xType: LVZXType;
    private yType: LVZYType;
    private mode: LVZDisplayMode;
    private dirty: boolean;

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
        this.dirty = true;
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

    // @Override
    public validate(): void {

    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
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
        if (this.image !== image) {
            this.image = image;
            this.setDirty(true);
        }
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
        if (this.x !== value) {
            this.x = value;
            this.setDirty(true);
        }
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
        if (this.y !== value) {
            this.y = value;
            this.setDirty(true);
        }
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
        if (this.id !== id) {
            this.id = id;
            this.setDirty(true);
        }
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
        if (this.layer !== layer) {
            this.layer = layer;
            this.setDirty(true);
        }
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
        if (this.mode !== mode) {
            this.mode = mode;
            this.setDirty(true);
        }
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
     * @param time The display-time to set. <br>
     *     <b>NOTE:</b> A display-time of '0' will show indefinitely until otherwise toggled off.
     */
    public setDisplayTime(time: number): void {
        if (this.time !== time) {
            this.time = time;
            this.setDirty(true);
        }
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
        if (this.xType !== type) {
            this.xType = type;
            this.setDirty(true);
        }
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
        if (this.yType !== type) {
            this.yType = type;
            this.setDirty(true);
        }
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
