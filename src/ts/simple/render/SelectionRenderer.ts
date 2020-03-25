import * as PIXI from "pixi.js";
import { Project } from '../Project';

/**
 * The <i>SelectionRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SelectionRenderer {

    project: Project;
    graphics: PIXI.Graphics;

    private readonly tops: RunLength[] = [];
    private readonly bottoms: RunLength[] = [];
    private readonly lefts: RunLength[] = [];
    private readonly rights: RunLength[] = [];

    /**
     * Main constructor.
     */
    constructor(project: Project) {

        this.project = project;

        this.graphics = new PIXI.Graphics();
    }

    update(): void {

        let camera = this.project.editor.renderer.camera;
        let selections = this.project.selections;
        if (selections.isDirty()) {
            this.build();
        }

        if (selections.isDirty() || camera.isDirty()) {
            this.draw();
            let cameraPosition = camera.position;
            let scale = cameraPosition.scale;
            let invScale = 1 / scale;
            let screen = this.project.editor.renderer.app.screen;
            let sw = screen.width * invScale;
            let sh = screen.height * invScale;
            let x = Math.floor((-1 + (-(cameraPosition.x * 16) + sw / 2)));
            let y = 1 + Math.floor((-(cameraPosition.y * 16) + sh / 2));
            this.graphics.x = x * scale;
            this.graphics.y = y * scale;
        }

        selections.setDirty(false);
    }

    build(): void {

        this.tops.length = 0;
        this.bottoms.length = 0;
        this.lefts.length = 0;
        this.rights.length = 0;

        let selections = this.project.selections;
        if (selections.isEmpty()) {
            return;
        }

        let range = selections.getBounds();
        let array = selections.getArray();

        let hasLeft = (x: number, y: number): boolean => {
            if (x == 0) {
                return false;
            }
            return array[x - 1][y];
        };

        let hasRight = (x: number, y: number): boolean => {
            if (x == array.length - 1) {
                return false;
            }
            return array[x + 1][y];
        };

        let hasTop = (x: number, y: number): boolean => {
            if (y == 0) {
                return false;
            }
            return array[x][y - 1];
        };

        let hasBottom = (x: number, y: number): boolean => {
            if (y == array[0].length - 1) {
                return false;
            }
            return array[x][y + 1];
        };

        let topCurrent: RunLength = null;
        let bottomCurrent: RunLength = null;

        let minPX = 1024;
        let minPY = 1024;
        let maxPX = -1;
        let maxPY = -1;

        for (let y = 0; y < array[0].length; y++) {
            for (let x = 0; x < array.length; x++) {

                if (!array[x][y]) {
                    if (topCurrent != null) {
                        this.tops.push(topCurrent);
                        topCurrent = null;
                    }
                    if (bottomCurrent != null) {
                        this.bottoms.push(bottomCurrent);
                        bottomCurrent = null;
                    }
                    continue;
                }

                if (!hasTop(x, y)) {
                    if (topCurrent == null) {
                        topCurrent = new RunLength(range.x1 + x, range.y1 + y, 1);
                    } else {
                        topCurrent.length++;
                    }
                } else {
                    if (topCurrent != null) {
                        this.tops.push(topCurrent);
                        topCurrent = null;
                    }
                }

                if (!hasBottom(x, y)) {
                    if (bottomCurrent == null) {
                        bottomCurrent = new RunLength(range.x1 + x, range.y1 + y, 1);
                    } else {
                        bottomCurrent.length++;
                    }
                } else {
                    if (bottomCurrent != null) {
                        this.bottoms.push(bottomCurrent);
                        bottomCurrent = null;
                    }
                }

                if (minPX > x) {
                    minPX = x;
                }
                if (maxPX < x) {
                    maxPX = x;
                }
                if (minPY > y) {
                    minPY = y;
                }
                if (maxPY < y) {
                    maxPY = y;
                }
            }

            if (topCurrent != null) {
                this.tops.push(topCurrent);
                topCurrent = null;
            }
            if (bottomCurrent != null) {
                this.bottoms.push(bottomCurrent);
                bottomCurrent = null;
            }
        }

        let leftCurrent: RunLength = null;
        let rightCurrent: RunLength = null;

        for (let x = 0; x < array.length; x++) {
            for (let y = 0; y < array[0].length; y++) {

                if (!array[x][y]) {
                    if (leftCurrent != null) {
                        this.lefts.push(leftCurrent);
                        leftCurrent = null;
                    }
                    if (rightCurrent != null) {
                        this.rights.push(rightCurrent);
                        rightCurrent = null;
                    }
                    continue;
                }

                if (!hasLeft(x, y)) {
                    if (leftCurrent == null) {
                        leftCurrent = new RunLength(range.x1 + x, range.y1 + y, 1);
                    } else {
                        leftCurrent.length++;
                    }
                } else {
                    if (leftCurrent != null) {
                        this.lefts.push(leftCurrent);
                        leftCurrent = null;
                    }
                }

                if (!hasRight(x, y)) {
                    if (rightCurrent == null) {
                        rightCurrent = new RunLength(range.x1 + x, range.y1 + y, 1);
                    } else {
                        rightCurrent.length++;
                    }
                } else {
                    if (rightCurrent != null) {
                        this.rights.push(rightCurrent);
                        rightCurrent = null;
                    }
                }
            }
            if (leftCurrent != null) {
                this.lefts.push(leftCurrent);
                leftCurrent = null;
            }
            if (rightCurrent != null) {
                this.rights.push(rightCurrent);
                rightCurrent = null;
            }
        }
    }

    draw(): void {

        let tileLength = 16 * this.project.editor.renderer.camera.position.scale;

        let g = this.graphics;
        g.clear();
        g.lineStyle(1.5, 0xFFFFFF, 1);

        if (this.tops.length !== 0) {
            for (let index = 0; index < this.tops.length; index++) {
                let next = this.tops[index];
                let y = next.y * tileLength;
                g.moveTo(tileLength * next.x, y);
                g.lineTo(tileLength * (next.x + next.length), y);
            }
        }

        if (this.bottoms.length !== 0) {
            for (let index = 0; index < this.bottoms.length; index++) {
                let next = this.bottoms[index];
                let y = (next.y + 1) * tileLength;
                g.moveTo(tileLength * next.x, y);
                g.lineTo(tileLength * (next.x + next.length), y);
            }
        }

        if (this.lefts.length !== 0) {
            for (let index = 0; index < this.lefts.length; index++) {
                let next = this.lefts[index];
                let x = next.x * tileLength;
                g.moveTo(x, tileLength * next.y);
                g.lineTo(x, tileLength * (next.y + next.length));
            }
        }

        if (this.rights.length !== 0) {
            for (let index = 0; index < this.rights.length; index++) {
                let next = this.rights[index];
                let x = (next.x + 1) * tileLength;
                g.moveTo(x, tileLength * next.y);
                g.lineTo(x, tileLength * (next.y + next.length));
            }
        }
    }
}

export class RunLength {

    x: number;
    y: number;
    length: number;

    constructor(x: number, y: number, length: number) {
        this.x = x;
        this.y = y;
        this.length = length;
    }
}
