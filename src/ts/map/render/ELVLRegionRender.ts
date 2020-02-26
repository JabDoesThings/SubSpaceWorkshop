import * as PIXI from "pixi.js";

import { ELVLRegion } from '../elvl/ELVL';
import { Renderer } from './Renderer';

/**
 * The <i>TileEntry</i> interface. TODO: Document.
 *
 * @author Jab
 */
interface TileEntry {
    index: number,
    x: number,
    y: number
}

/**
 * The <i>ELVLRegionRender</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionRender {

    private entries: TileEntry[];

    private region: ELVLRegion;

    container: PIXI.Container;

    private bounds: PIXI.Rectangle;
    private view: Renderer;

    /**
     * Main constructor.
     *
     * @param region The region to render.
     */
    constructor(view: Renderer, region: ELVLRegion) {

        this.view = view;
        this.region = region;

        this.entries = [];

        this.container = new PIXI.Container();
        this.bounds = new PIXI.Rectangle(0, 0, 0, 0);

        this.compile();
    }

    private compile(): void {

        let tileData = this.region.tileData;
        let tiles = tileData.tiles;

        let minX = 999999;
        let minY = 999999;
        let maxX = -999999;
        let maxY = -999999;

        this.entries = [];

        for (let y = 0; y < 1024; y++) {
            for (let x = 0; x < 1024; x++) {
                if (tiles[x][y]) {

                    let entry = {
                        x: x,
                        y: y,
                        index: this.entries.length
                    };

                    this.entries.push(entry);

                    if (x < minX) {
                        minX = x;
                    }
                    if (x > maxX) {
                        maxX = x;
                    }
                    if (y < minY) {
                        minY = y;
                    }
                    if (y > maxY) {
                        maxY = y;
                    }
                }
            }
        }

        if (this.entries.length != 0) {

            this.bounds.x = minX;
            this.bounds.y = minY;
            this.bounds.width = maxX - minX;
            this.bounds.height = maxY - minY;

            // this.bounds.x = 0;
            // this.bounds.y = 0;
            // this.bounds.width = 1024;
            // this.bounds.height = 1024;

        } else {
            this.bounds.x = 0;
            this.bounds.y = 0;
            this.bounds.width = 0;
            this.bounds.height = 0;
        }

        this.draw();
    }

    update(): void {
        let camera = this.view.camera;

        if (camera.isDirty()) {

            let sw = this.view.app.view.width;
            let sh = this.view.app.view.height;

            let cpos = camera.getPosition();

            let x1 = this.bounds.x;
            let y1 = this.bounds.y;

            let cx = cpos.x * 16;
            let cy = cpos.y * 16;
            let cx1 = cx - (sw / 2);
            let cy1 = cy - (sh / 2);

            this.container.x = Math.round(x1 - cx1);
            this.container.y = Math.round(y1 - cy1);
        }
    }

    /**
     * @return Returns the ELVLRegion rendered.
     */
    getRegion(): ELVLRegion {
        return this.region;
    }

    private draw() {

        this.container.removeChildren();

        let x1 = this.bounds.x, y1 = this.bounds.y;

        let c = this.region.color;
        let color = (255 & 0xFF) << 24 | (c[0] & 0xFF) << 16 | (c[1] & 0xFF) << 8 | (c[2] & 0xFF);

        let index = 0;
        while (index < this.entries.length) {

            let gIndex = 0;
            let g = new PIXI.Graphics();

            while (gIndex < 0x1000) {

                let next = this.entries[index++];

                g.beginFill(color);
                g.drawRect(-x1 + (next.x * 16), -y1 + (next.y * 16), 16, 16);
                g.endFill();

                gIndex++;

                if (index == this.entries.length) {
                    break;
                }
            }

            this.container.addChild(g);
        }
    }
}
