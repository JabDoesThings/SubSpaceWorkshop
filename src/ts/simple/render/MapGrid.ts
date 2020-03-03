import * as PIXI from "pixi.js";
import { MapRenderer } from './MapRenderer';

export class MapGrid extends PIXI.Container {

    private view: MapRenderer;

    renderBaseGrid: boolean;
    renderAxisLines: boolean;
    renderBorderLines: boolean;
    renderChunkLines: boolean;

    private baseGrid: PIXI.Graphics;
    private chunkGrid: PIXI.Graphics;
    private centerLines: PIXI.Graphics;
    private borderLines: PIXI.Graphics;

    constructor(view: MapRenderer) {

        super();

        this.cacheAsBitmap = false;

        this.view = view;
        this.renderBaseGrid = true;
        this.renderAxisLines = true;
        this.renderBorderLines = true;
        this.renderChunkLines = true;

        this.baseGrid = new PIXI.Graphics();
        this.chunkGrid = new PIXI.Graphics();
        this.centerLines = new PIXI.Graphics();
        this.borderLines = new PIXI.Graphics();

        this.addChild(this.baseGrid);
        this.addChild(this.chunkGrid);
        this.addChild(this.centerLines);
        this.addChild(this.borderLines);
    }

    draw() {

        // Grab the dimensions of the app view.
        let sw = Math.floor(this.view.app.view.width);
        let sh = Math.floor(this.view.app.view.height);
        let sw2 = sw / 2;
        let sh2 = sh / 2;

        // Grab the camera's position on the app view.
        let camPos = this.view.camera.getPosition();
        let cx = camPos.x * 16.0;
        let cy = camPos.y * 16.0;

        // Grab the edge coordinates of the view.
        let x1 = Math.floor(cx - sw2);
        let y1 = Math.floor(cy - sh2);
        let x2 = Math.floor(cx + sw2);
        let y2 = Math.floor(cy + sh2);

        let center = 512 * 16;
        let screenCenterX = center - x1;
        let screenCenterY = center - y1;

        let left = -x1;
        let top = -y1;
        let right = (1024 * 16) - x1;
        let bottom = (1024 * 16) - y1;

        let startX = Math.floor(x1);
        let startY = Math.floor(y1);
        let endX = Math.ceil(x2);
        let endY = Math.ceil(y2);

        let offsetX = screenCenterX;
        let offsetY = screenCenterY;

        if (screenCenterX > 0) {
            while (offsetX >= 0) {
                offsetX -= 16;
            }
        } else if (screenCenterX < 0) {
            while (offsetX <= 0) {
                offsetX += 16;
            }
        }
        if (screenCenterY > 0) {
            while (offsetY >= 0) {
                offsetY -= 16;
            }
        } else if (screenCenterY < 0) {
            while (offsetY <= 0) {
                offsetY += 16;
            }
        }

        offsetX = Math.floor(offsetX);
        offsetY = Math.floor(offsetY);

        if (this.renderBaseGrid) {

            this.baseGrid.clear();
            this.baseGrid.lineStyle(1, 0x444444, 0.1);

            // Horizontal lines.
            for (let y = Math.max(-offsetY, startY); y <= Math.min(1023 * 16, endY + 16); y += 16) {
                this.baseGrid.moveTo(Math.max(0, left), Math.floor((y - y1) + offsetY));
                this.baseGrid.lineTo(Math.min(right, sw), Math.floor((y - y1) + offsetY));
            }

            // Vertical lines.
            for (let x = Math.max(-offsetX, startX); x <= Math.min(1023 * 16, endX + 16); x += 16) {
                this.baseGrid.moveTo(Math.floor((x - x1) + offsetX), Math.max(0, top));
                this.baseGrid.lineTo(Math.floor((x - x1) + offsetX), Math.min(sh, bottom));
            }
        }

        if (this.renderChunkLines) {

            this.chunkGrid.clear();
            this.chunkGrid.lineStyle(1, 0xff0000, 0.2);

            for (let z = 64 * 16; z < 1024 * 16; z += 64 * 16) {

                if (y1 <= z && y2 >= z) {
                    let y = z - y1;
                    let xMin = Math.max(left, 0);
                    let xMax = Math.min(right, sw);
                    this.chunkGrid.moveTo(xMin, y);
                    this.chunkGrid.lineTo(xMax, y);
                }

                if (x1 <= z && x2 >= z) {
                    let x = z - x1;
                    let yMin = Math.max(top, 0);
                    let yMax = Math.min(bottom, sh);
                    this.chunkGrid.moveTo(x, yMin);
                    this.chunkGrid.lineTo(x, yMax);
                }

            }
        }

        if (this.renderAxisLines) {

            this.centerLines.clear();
            this.centerLines.lineStyle(1, 0x0000ff, 0.2);

            let drawCenterX = screenCenterX > 0 && screenCenterX <= sw;
            let drawCenterY = screenCenterY > 0 && screenCenterY <= sh;

            if (drawCenterX) {
                this.centerLines.moveTo(Math.floor(screenCenterX), Math.max(0, top));
                this.centerLines.lineTo(Math.floor(screenCenterX), Math.min(sh, bottom));
            }

            if (drawCenterY) {
                this.centerLines.moveTo(Math.max(0, left), Math.floor(screenCenterY));
                this.centerLines.lineTo(Math.min(right, sw), Math.floor(screenCenterY));
            }
        }

        if (this.renderBorderLines) {

            this.borderLines.clear();
            this.borderLines.lineStyle(1.5, 0x0000ff, 0.2);

            let drawLeft = left > 0 && left <= sw;
            let drawTop = top > 0 && top <= sh;
            let drawRight = right > 0 && right <= sw;
            let drawBottom = bottom > 0 && bottom <= sh;

            if (drawLeft) {
                this.borderLines.moveTo(Math.floor(left), Math.max(0, top));
                this.borderLines.lineTo(Math.floor(left), Math.min(sh, bottom));
            }
            if (drawTop) {
                this.borderLines.moveTo(Math.max(0, left), Math.floor(top));
                this.borderLines.lineTo(Math.min(right, sw), Math.floor(top));
            }
            if (drawRight) {
                this.borderLines.moveTo(Math.floor(right), Math.max(0, top));
                this.borderLines.lineTo(Math.floor(right), Math.min(sh, bottom));
            }
            if (drawBottom) {
                this.borderLines.moveTo(Math.max(0, left), Math.floor(bottom));
                this.borderLines.lineTo(Math.min(right, sw), Math.floor(bottom));
            }
        }
    }

}
