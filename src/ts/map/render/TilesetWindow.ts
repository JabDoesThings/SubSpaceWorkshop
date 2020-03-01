import { Renderer } from './Renderer';
import ClickEvent = JQuery.ClickEvent;
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;
import MouseUpEvent = JQuery.MouseUpEvent;

export class TilesetWindow {

    private view: Renderer;
    private canvas: HTMLCanvasElement;

    primary: number;
    secondary: number;
    private primaryBox: HTMLElement;
    private secondaryBox: HTMLElement;

    private coordinates: number[][];
    private atlas: number[][];

    constructor(view: Renderer) {
        this.view = view;
        this.canvas = <HTMLCanvasElement> document.getElementById('tileset');
        this.primaryBox = document.getElementById('tileset-primary');
        this.secondaryBox = document.getElementById('tileset-secondary');

        this.coordinates = [];
        this.coordinates.push([-32, -32]);
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 19; x++) {
                this.coordinates.push([x * 16, y * 16]);
            }
        }

        let offset = 1;
        this.atlas = [];
        for (let y = 0; y < 10; y++) {
            this.atlas[y] = [];
            for (let x = 0; x < 19; x++) {
                this.atlas[y].push(offset++);
            }
        }

        let down = false;
        let downButton = -99999;

        let update = (button: number, mx: number, my: number): void => {

            let tx = (mx - (mx % 16)) / 16;
            let ty = (my - (my % 16)) / 16;

            console.log('mx=' + mx + ', my=' + my + ', tx=' + tx + ', ty=' + ty);
            if (tx >= 0 && tx < 19 && ty >= 0 && ty < 10) {
                let tileId = this.atlas[ty][tx];

                if (button == 0) {
                    this.setPrimary(tileId);
                } else if (button == 2) {
                    this.setSecondary(tileId);
                }
            }
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

                if(downButton !== -99999) {
                    button = downButton;
                }

                update(button, mx, my);
            }
        });

        this.setPrimary(1);
        this.setSecondary(2);
    }

    setPrimary(id: number): void {

        if (this.primary !== id) {

            this.primary = id;

            if (this.primary <= 190) {
                let coords = this.coordinates[this.primary];
                this.primaryBox.style.top = coords[1] + "px";
                this.primaryBox.style.left = coords[0] + "px";
            }
        }

    }

    setSecondary(id: number): void {

        if (this.secondary !== id) {

            this.secondary = id;

            if (this.secondary <= 190) {
                let coords = this.coordinates[this.secondary];
                this.secondaryBox.style.top = coords[1] + "px";
                this.secondaryBox.style.left = coords[0] + "px";
            }
        }
    }

    update(): void {
        let tileset = this.view.map.tileset;
        if (tileset.isDirty()) {
            this.draw();
        }
    }

    draw(): void {
        let tileset = this.view.map.tileset;
        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 304, 160);
        ctx.drawImage(tileset.source, 0, 0);
    }

}
