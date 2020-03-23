import * as PIXI from "pixi.js";
import { Session } from '../Session';

/**
 * The <i>SelectionRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SelectionRenderer {

    session: Session;
    graphics: PIXI.Graphics;
    fillSprite: PIXI.Sprite;
    // fillContainer: PIXI.Container;
    // graphicsFill: PIXI.Graphics;

    private readonly tops: RunLength[] = [];
    private readonly bottoms: RunLength[] = [];
    private readonly lefts: RunLength[] = [];
    private readonly rights: RunLength[] = [];

    /**
     * Main constructor.
     */
    constructor(session: Session) {

        this.session = session;

        this.graphics = new PIXI.Graphics();
        // this.graphicsFill = new PIXI.Graphics();
        // this.fillContainer = new PIXI.Container();
    }

    update(): void {

        let camera = this.session.editor.renderer.camera;

        let map = this.session.map;
        let selections = map.selections;
        if (selections.isDirty()) {
            this.build();
        }

        if (selections.isDirty() || camera.isDirty()) {
            this.draw();
            let cameraPosition = camera.position;
            let scale = cameraPosition.scale;
            let invScale = 1 / scale;
            let screen = this.session.editor.renderer.app.screen;
            let sw = screen.width * invScale;
            let sh = screen.height * invScale;
            let x = Math.floor((-1 + (-(cameraPosition.x * 16) + sw / 2)));
            let y = 1 + Math.floor((-(cameraPosition.y * 16) + sh / 2));
            this.graphics.x /*= this.graphicsFill.x */= x * scale;
            this.graphics.y /*= this.graphicsFill.y */= y * scale;
            // this.fillContainer.x = x * scale;
            // this.fillContainer.y = y * scale;
            // this.fillContainer.scale.x = this.fillContainer.scale.y = scale;
        }
    }

    build(): void {

        let g = this.graphics;
        g.clear();

        // let gf = this.graphicsFill;
        // gf.clear();

        let map = this.session.map;
        let selections = map.selections;
        if (selections.isEmpty()) {
            return;
        }

        let range = map.selections.getBounds();
        let array = map.selections.getArray();

        console.log(map.selections);

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

        this.tops.length = 0;
        this.bottoms.length = 0;
        this.lefts.length = 0;
        this.rights.length = 0;

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

        if (this.fillSprite != null) {
            this.fillSprite.texture.destroy(true);
        }







        // gf.clear();
        // gf.lineStyle(1, 0xFF0000);
        // gf.beginFill(0xFF0000);
        // for (let y = minPY; y <= maxPY; y++) {
        //     for (let x = minPX; x <= maxPX; x++) {
        //         if (array[x][y]) {
        //             gf.drawRect(x, y, 1, 1);
        //         }
        //     }
        // }
        // gf.endFill();
        //
        // let texture = this.session.editor.renderer.app.renderer.generateTexture(
        //     gf,
        //     PIXI.SCALE_MODES.NEAREST,
        //     1,
        //     new Rectangle(
        //         minPX,
        //         minPY,
        //         (maxPX) - (minPX) + 1,
        //         (maxPY) - (minPY) + 1
        //     )
        // );

        // this.fillSprite = new PIXI.Sprite(texture);
        // this.fillSprite.x = minPX * 16;
        // this.fillSprite.y = minPY * 16;
        // this.fillSprite.scale.x = this.fillSprite.scale.y = 16;

        // this.fillContainer.removeChildren();
        // this.fillContainer.addChild(this.fillSprite);
        //
        // console.log(this.fillSprite);








        // minPX = (minPX << 4) + range.x1;
        // minPY = (minPY << 4) + range.y1;
        // maxPX = (maxPX << 4) + range.x1;
        // maxPY = (maxPY << 4) + range.y1;
        //
        // for (let index = 0; index < selections.sections.length; index++) {
        //
        //     let next = selections.sections[index];
        //     let x1 = (next.bounds.x1) << 4;
        //     let y1 = (next.bounds.y1) << 4;
        //     let x2 = (next.bounds.x2) << 4;
        //     let y2 = (next.bounds.y2) << 4;
        //
        //     let color = next.invert ? 0x010101 : 0x0;
        //     gf.beginFill(color);
        //     gf.drawRect(
        //         Math.max(x1, minPX),
        //         Math.max(y1, minPY),
        //         Math.min(x2 - x1 + 16, maxPX),
        //         Math.min(y2 - y1 + 16, maxPY)
        //     );
        //     gf.endFill();
        // }
    }

    draw(): void {

        let tileLength = 16 * this.session.editor.renderer.camera.position.scale;

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
