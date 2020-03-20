import MouseDownEvent = JQuery.MouseDownEvent;
import MouseMoveEvent = JQuery.MouseMoveEvent;
import { Vector2 } from 'three';
import { Renderer } from './Renderer';
import { PathMode } from '../util/Path';
import { Dirtable } from '../util/Dirtable';

/**
 * The <i>Radar</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Radar implements Dirtable {

    protected readonly view: Renderer;
    private readonly canvas: HTMLCanvasElement;
    protected readonly drawCanvas: HTMLCanvasElement;
    private readonly largeSize: number;
    private readonly smallSize: number;

    lock: boolean;
    private large: boolean;
    private dirty: boolean;

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

            let cPos = this.view.camera.position;
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

            this.view.camera.pathTo({
                x: mapX,
                y: mapY,
                scale: this.view.camera.position.scale
            }, ticks, PathMode.EASE_OUT);
        };

        $(document).on('mousedown', '#' + this.canvas.id, (e: MouseDownEvent) => {
            down = true;

            let button = e.button;
            downButton = button;
            let mx = e.offsetX;
            let my = e.offsetY;

            update(button, mx, my);
        });

        $(document).on('mouseup', () => {
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

        this.dirty = true;
    }

    update(): void {

        let alt = this.view.camera.isKeyDown("alt");

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

        if(this.isDirty()) {
            this.draw().finally(()=> {
               this.apply();
            });
            this.setDirty(false);
        }
    }

    apply(): void {
        let largeSize = Math.min(this.largeSize, this.view.app.screen.height - 24);
        let ctx = this.canvas.getContext('2d');
        let size = this.large ? largeSize : this.smallSize;
        ctx.drawImage(this.drawCanvas, 0, 0, 1024, 1024, 0, 0, size, size);
    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    async draw() {
    }
}
