import LVZPackage from '../compiled/LVZPackage';
import CompressedLVZSection from './CompressedLVZSection';
import { decompressLVZ } from '../LVZUtils';

/**
 * The <i>CompressedLVZPackage</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class CompressedLVZPackage {
  public sections: CompressedLVZSection[] = [];
  public name: string;

  /** @param name The name of the package. (The name of the LVZ file) */
  constructor(name: string) {
    this.name = name;
  }

  public inflate(): LVZPackage {
    return decompressLVZ(this);
  }

  /**
   * Tests whether the binary section is registered in the package.
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

    for (let key in this.sections) {
      let value = this.sections[key];
      if (value === section) {
        return true;
      }
    }
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
      throw new Error('The LVZCompressedSection given is null or undefined.');
    }

    // Make sure that the section isn't already registered to the package.
    if (this.hasSection(section)) {
      // Make sure that Object-Data sections have a label.
      let fileName = section.fileName;
      if (fileName == null || fileName.length === 0) {
        fileName = '[OBJECT DATA SECTION]';
      }
      throw new Error(`The LVZCompressedPackage "${this.name}" already has the LVZCompressedSection "${fileName}".`);
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
      throw new Error('The LVZCompressedSection given is null or undefined.');
    }

    // Make sure that the section is registered to the package.
    if (!this.hasSection(section)) {
      // Make sure that Object-Data sections have a label.
      let fileName = section.fileName;
      if (fileName == null || fileName.length === 0) {
        fileName = '[OBJECT DATA SECTION]';
      }
      throw new Error(`The LVZCompressedPackage "${this.name}" does not contain the LVZCompressedSection "${fileName}".`);
    }

    const newArray: CompressedLVZSection[] = [];
    let offset: number = 0;
    for (let index = 0; index < this.sections.length; index++) {
      const nextSection = this.sections[index];
      if (nextSection === section) {
        continue;
      }
      newArray[offset++] = nextSection;
    }

    this.sections = newArray;
  }

  /** @return Returns all registered sections in the binary package. */
  public getSections(): CompressedLVZSection[] {
    return this.sections;
  }

  /** @return Returns the count of registered sections in the binary package. */
  public getSectionCount(): number {
    return this.sections.length;
  }
}
