import Validatable from '../../util/Validatable';
import Dirtable from '../../util/Dirtable';
import * as fs from "fs";
import * as zlib from "zlib";
import CompressedLVZSection from './binary/CompressedLVZSection';
import { LVZErrorStatus } from './LVZProperties';
import { validateLVZResource } from './LVZUtils';

const ACCEPTED_FORMATS = ['bm2', 'bmp', 'png', 'gif', 'jpg'];

/**
 * The <i>LVZResource</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class LVZResource implements Validatable, Dirtable {
  private data: Buffer;
  private name: string;
  private time: number;
  private dirty: boolean;

  /**
   * @param {string} nameOrPath
   * @param {Buffer} data
   * @param {number} time
   */
  constructor(nameOrPath: string, data: Buffer = null, time: number = null) {
    // If the data is not defined, assume the name is actually a file path to read.
    if (data == null) {
      // Make sure the file exists before loading it.
      if (!fs.existsSync(nameOrPath)) {
        throw new Error(`The file does not exist: ${nameOrPath}`);
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

  /** @override */
  public toString(): string {
    return `LVZResource={name=${this.name}, time=${this.time}, data=Buffer (${this.data.length} bytes)}`;
  }

  /** @override */
  public validate(): void {
    let status = validateLVZResource(this);
    if (status !== LVZErrorStatus.SUCCESS) {
      let message = `Error Code: ${status}`;
      if (status === LVZErrorStatus.RESOURCE_DATA_NULL) {
        message = 'The LVZResource does not have a data buffer.';
      } else if (status === LVZErrorStatus.RESOURCE_NAME_NULL) {
        message = 'The LVZResource name is null or undefined.';
      } else if (status === LVZErrorStatus.RESOURCE_NAME_EMPTY) {
        message = 'The LVZResource name is empty.';
      } else if (status === LVZErrorStatus.RESOURCE_TIME_NEGATIVE) {
        message = 'The LVZResource timestamp is negative.';
      }
      console.log(message);
      throw new EvalError(message);
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  compress(): CompressedLVZSection {
    const compressedData = zlib.deflateSync(this.data);
    const compressSize = compressedData.length;
    return new CompressedLVZSection(this.data.length, this.time, compressSize, this.name, compressedData);
  }

  equals(other: any): boolean {
    if (other instanceof LVZResource) {
      return other.data === this.data
        && other.name === this.name
        && other.time === this.time;
    }
    return false;
  }

  getData(): Buffer {
    return this.data;
  }

  setData(data: Buffer): void {
    if (!data.equals(this.data)) {
      this.data = data;
      this.setDirty(true);
    }
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    if (this.name !== name) {
      this.name = name;
      this.setDirty(true);
    }
  }

  getTime(): number {
    return this.time;
  }

  setTime(time: number): void {
    if (this.time !== time) {
      this.time = time;
      this.setDirty(true);
    }
  }

  isImage(): boolean {
    const extension = this.getExtension();
    for (let index = 0; index < ACCEPTED_FORMATS.length; index++) {
      if (extension === ACCEPTED_FORMATS[index]) {
        return true;
      }
    }
    return false;
  }

  getExtension(): string {
    if (this.name.indexOf('.') != -1) {
      return this.name.toLowerCase().split('.')[1].trim();
    }
    return null;
  }

  getMimeType() {
    switch (this.getExtension()) {
      case 'bm2':
      case 'bmp':
        return 'image/bmp';
      case 'gif':
        return 'image/gif';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
    }
    return null;
  }

  isEmpty(): boolean {
    return this.data == null || this.data.length === 0;
  }
}
