import { LVLMap } from '../lvl/LVL';
import { Renderer } from './Renderer';
import MouseDownEvent = JQuery.MouseDownEvent;
import MouseUpEvent = JQuery.MouseUpEvent;
import MouseMoveEvent = JQuery.MouseMoveEvent;
import { Vector2 } from 'three';
import { PathMode } from '../../util/Path';

export class Radar {

    private readonly view: Renderer;
    private readonly canvas: HTMLCanvasElement;
    private readonly drawCanvas: HTMLCanvasElement;
    private readonly largeSize: number;
    private readonly smallSize: number;

    private large: boolean;
    lock: boolean;

    constructor(view: Renderer) {
        this.view = view;
        this.canvas = <HTMLCanvasElement> document.getElementById('radar');
        this.drawCanvas = document.createElement('canvas');
        this.drawCanvas.width = 1024;
        this.drawCanvas.height = 1024;
        this.largeSize = 768;
        this.smallSize = 256;

        this.lock = false;

        let down = false;
        let downButton = -99999;

        let update = (button: number, mx: number, my: number): void => {
            let lx = mx / this.canvas.width;
            let ly = my / this.canvas.height;

            let mapX = Math.floor(lx * 1024);
            let mapY = Math.floor(ly * 1024);

            let cPos = this.view.camera.getPosition();
            let v1 = new Vector2(mapX, mapY);
            let v2 = new Vector2(cPos.x, cPos.y);

            let dist = v1.distanceTo(v2);

            if (dist == 0) {
                return;
            }

            let ticks = Math.floor(dist / 10);

            if (ticks < 10) {
                ticks = 10;
            } else if (ticks > 60) {
                ticks = 60;
            }

            this.view.camera.pathTo({x: mapX, y: mapY}, ticks, PathMode.EASE_OUT);
        };

        $(document).on('mousedown', '#' + this.canvas.id, (e: MouseDownEvent) => {
            down = true;

            let button = e.button;
            downButton = button;
            let mx = e.offsetX;
            let my = e.offsetY;

            update(button, mx, my);
        });

        $(document).on('mouseup', (e: MouseUpEvent) => {
            down = false;
            downButton = -99999;
        });

        $(document).on('mousemove', '#' + this.canvas.id, (e: MouseMoveEvent) => {

            if (down) {

                let button = e.button;
                let mx = e.offsetX;
                let my = e.offsetY;

                if (downButton !== -99999) {
                    button = downButton;
                }

                update(button, mx, my);
            }
        });
    }

    update(): void {

        let alt = this.view.camera.alt.isDown;

        let largeSize = Math.min(this.largeSize, this.view.app.screen.height - 24);

        if (!this.large && alt) {
            this.large = true;
            this.canvas.parentElement.classList.add("large");
            this.canvas.width = largeSize;
            this.canvas.height = largeSize;
            this.canvas.parentElement.style.width = largeSize + 'px';
            this.canvas.parentElement.style.height = largeSize + 'px';
            this.apply();
        } else if (this.large && !alt) {
            this.large = false;
            this.canvas.parentElement.classList.remove("large");
            this.canvas.width = this.smallSize;
            this.canvas.height = this.smallSize;
            this.canvas.parentElement.style.width = this.smallSize + 'px';
            this.canvas.parentElement.style.height = this.smallSize + 'px';
            this.apply();
        }
    }

    apply(): void {
        let largeSize = Math.min(this.largeSize, this.view.app.screen.height - 24);
        let ctx = this.canvas.getContext('2d');
        let size = this.large ? largeSize : this.smallSize;
        ctx.drawImage(this.drawCanvas, 0, 0, 1024, 1024, 0, 0, size, size);
    }

    async draw() {

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
