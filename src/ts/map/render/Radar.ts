import { LVLMap } from '../lvl/LVL';
import { Renderer } from './Renderer';

export class Radar {

    private readonly view: Renderer;
    private readonly canvas: HTMLCanvasElement;
    private readonly drawCanvas: HTMLCanvasElement;
    private large: boolean;

    private largeSize: number;
    private smallSize: number;

    constructor(view: Renderer) {
        this.view = view;
        this.canvas = <HTMLCanvasElement> document.getElementById('radar');
        this.drawCanvas = document.createElement('canvas');
        this.drawCanvas.width = 1024;
        this.drawCanvas.height = 1024;
        this.largeSize = 768;
        this.smallSize = 256;
    }

    update(): void {

        let copy = false;
        let map = this.view.map;
        let alt = this.view.camera.alt.isDown;

        let largeSize = Math.min(this.largeSize, this.view.app.screen.height - 24);

        if (!this.large && alt) {
            this.large = true;
            this.canvas.parentElement.classList.add("large");
            this.canvas.width = largeSize;
            this.canvas.height = largeSize;
            this.canvas.parentElement.style.width = largeSize + 'px';
            this.canvas.parentElement.style.height = largeSize + 'px';
            copy = true;
        } else if (this.large && !alt) {
            this.large = false;
            this.canvas.parentElement.classList.remove("large");
            this.canvas.width = this.smallSize;
            this.canvas.height = this.smallSize;
            this.canvas.parentElement.style.width = this.smallSize + 'px';
            this.canvas.parentElement.style.height = this.smallSize + 'px';
            copy = true;
        }

        if (map.isDirty()) {
            this.draw();
            copy = true;
        }

        if (copy) {
            let ctx = this.canvas.getContext('2d');
            let size = this.large ? largeSize : this.smallSize;
            ctx.drawImage(this.drawCanvas, 0, 0, 1024, 1024, 0, 0, size, size);
        }
    }

    draw(): void {

        let map = this.view.map;
        let tileset = map.tileset;

        let ctx = this.drawCanvas.getContext('2d');

        // Clear the radar to its clear color.
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 1024, 1024);

        for (let y = 0; y < 1024; y++) {
            for (let x = 0; x < 1024; x++) {
                let tileId = map.getTile(x, y);
                if (tileId != 0) {

                    if (tileId <= 190) {
                        ctx.fillStyle = tileset.tileColor[tileId];
                        ctx.fillRect(x, y, 1, 1);
                    } else if (tileId == 216) {
                        ctx.fillStyle = '#4b3225';
                        ctx.fillRect(x, y, 1, 1);
                    } else if (tileId == 217) {
                        ctx.fillStyle = '#4b3225';
                        ctx.fillRect(x, y, 2, 2);
                    } else if (tileId == 218) {
                        ctx.fillStyle = '#4b3225';
                        ctx.fillRect(x, y, 1, 1);
                    } else if (tileId == 219) {
                        ctx.fillStyle = '#4b4b4b';
                        ctx.fillRect(x, y, 6, 6);
                    } else if (tileId == 220) {
                        ctx.fillStyle = '#710066';
                        ctx.fillRect(x, y, 5, 5);
                    } else {
                        ctx.fillStyle = '#d500d5';
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        }
    }
}
