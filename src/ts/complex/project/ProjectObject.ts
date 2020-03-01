import uuid = require('uuid');

/**
 * The <i>ProjectObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ProjectObject {

    readonly id: string;

    constructor(id: string = uuid.v4()) {
        this.id = id;
    }

}

/**
 * The <i>ProjectFolder</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ProjectFolder extends ProjectObject {

    readonly contents: ProjectObject[];

    constructor() {

        super();

        this.contents = [];
    }

    hasContent(content: ProjectObject): boolean {

        if (this.contents.length === 0) {
            return false;
        }

        for (let index = 0; index < this.contents.length; index++) {
            let next = this.contents[index];
            if (next.id === content.id) {
                return true;
            }
        }

        return false;
    }

    addContent(content: ProjectObject): void {
        this.contents.push(content);
    }

    removeContent(content: ProjectObject): void {

        if (!this.hasContent(content)) {
            throw new Error();
        }

        let array = [];
        let index = this.contents.length - 1;

        while (true) {

            let next = this.contents[index];
            if (next.id === content.id) {
                break;
            }

            array.push(next);
            index--;
        }

        if (array.length != 0) {
            array = array.reverse();
        }

        for (index = 0; index < array.length; index++) {
            this.contents.push(array[index]);
        }
    }

    clear(): void {
        while (this.contents.length > 0) {
            this.contents.pop();
        }
    }

    size(): number {
        return this.contents.length;
    }
}
