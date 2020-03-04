import * as PIXI from "pixi.js";
import { MapRenderer } from './MapRenderer';

export class MapGrid extends PIXI.Container {

    private view: MapRenderer;

    renderBaseGrid: boolean;
    renderAxisLines: boolean;
    renderBorderLines: boolean;
    renderChunkGrid: boolean;

    private readonly baseGrid: PIXI.Graphics;
    private readonly chunkGrid: PIXI.Graphics;
    private readonly axisLines: PIXI.Graphics;
    private readonly borderLines: PIXI.Graphics;

    constructor(view: MapRenderer) {

        super();

        this.cacheAsBitmap = false;

        this.view = view;
        this.renderBaseGrid = true;
        this.renderAxisLines = true;
        this.renderBorderLines = true;
        this.renderChunkGrid = true;

        this.baseGrid = new PIXI.Graphics();
        this.chunkGrid = new PIXI.Graphics();
        this.axisLines = new PIXI.Graphics();
        this.borderLines = new PIXI.Graphics();
        this.addChild(this.baseGrid);
        this.addChild(this.chunkGrid);
        this.addChild(this.axisLines);
        this.addChild(this.borderLines);

        this.drawActual();
    }

    private drawActual(): void {

        let camera = this.view.camera;
        let cpos = camera.position;
        let scale = cpos.scale;

        let mapLength = 1024;
        let tileLength = 16 * scale;

        this.baseGrid.clear();
        this.chunkGrid.clear();
        this.axisLines.clear();
        this.borderLines.clear();

        if (this.renderBaseGrid && scale > 0.25) {

            let alpha = (scale - 0.25) * 2;

            if (alpha > 1) {
                alpha = 1;
            } else if (alpha <= 0) {
                alpha = 0;
            }

            this.baseGrid.alpha = alpha;

            if (alpha > 0) {
                this.baseGrid.lineStyle(1, 0x444444, 0.1, 0.5, true);
                for (let index = 0; index < 1025; index++) {
                    let x1 = index * tileLength;
                    let y1 = 0;
                    let x2 = index * tileLength;
                    let y2 = mapLength * tileLength;
                    this.baseGrid.moveTo(x1, y1);
                    this.baseGrid.lineTo(x2, y2);
                    this.baseGrid.moveTo(y1, x1);
                    this.baseGrid.lineTo(y2, x2);
                }
            }
        }

        if (scale > 0.1) {
            let alpha = (scale - 0.1) * 4;
            if (alpha > 1) {
                alpha = 1;
            } else if (alpha < 0) {
                alpha = 0;
            }

            this.chunkGrid.alpha = alpha;
            this.axisLines.alpha = alpha;

            if (alpha > 0) {

                if (this.renderChunkGrid) {
                    this.chunkGrid.lineStyle(1, 0x770000, 1, 0.5, true);
                    for (let index = 0; index <= 16; index++) {
                        let x1 = (index * 64) * tileLength;
                        let y1 = 0;
                        let y2 = (16 * 64) * tileLength;
                        this.chunkGrid.moveTo(x1, y1);
                        this.chunkGrid.lineTo(x1, y2);
                        this.chunkGrid.moveTo(y1, x1);
                        this.chunkGrid.lineTo(y2, x1);
                    }
                }

                if (this.renderAxisLines) {
                    this.axisLines.lineStyle(3, 0x7777ff, 1, 0.5, true);
                    this.axisLines.moveTo((mapLength / 2) * 16 * scale, 0);
                    this.axisLines.lineTo((mapLength / 2) * 16 * scale, 1024 * 16 * scale);
                    this.axisLines.moveTo(0, (mapLength / 2) * 16 * scale);
                    this.axisLines.lineTo(1024 * 16 * scale, (mapLength / 2) * 16 * scale);
                }
            }
        }

        if (this.renderBorderLines) {
            let length = mapLength * tileLength;
            this.borderLines.lineStyle(3, 0x7777ff, 0.5, 0.5, true);
            this.borderLines.moveTo(0, 0);
            this.borderLines.lineTo(0, length);
            this.borderLines.moveTo(0, 0);
            this.borderLines.lineTo(length, 0);
            this.borderLines.moveTo(length, 0);
            this.borderLines.lineTo(length, length);
            this.borderLines.moveTo(0, length);
            this.borderLines.lineTo(length, length);
        }
    }

    scalePrevious: number = -1;

    draw() {

        let camera = this.view.camera;
        let cpos = camera.position;
        let cx = cpos.x * 16;
        let cy = cpos.y * 16;
        let scale = cpos.scale;

        if (scale != this.scalePrevious) {
            this.drawActual();
            this.scalePrevious = scale;
        }

        let screen = this.view.app.screen;
        let sw2 = screen.width / 2;
        let sh2 = screen.height / 2;

        let gx = (sw2 - (cx * scale));
        let gy = (sh2 - (cy * scale));

        this.baseGrid.position.x = gx;
        this.baseGrid.position.y = gy;
        this.borderLines.position.x = gx;
        this.borderLines.position.y = gy;
        this.chunkGrid.position.x = gx;
        this.chunkGrid.position.y = gy;
        this.axisLines.position.x = gx;
        this.axisLines.position.y = gy;
    }

}
