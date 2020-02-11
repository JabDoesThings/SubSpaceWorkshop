import * as PIXI from 'pixi.js';
import { Map } from './Map';
import { Vector2 } from 'three';

export class MapViewer {

    private camera: Vector2;

    private map: Map;

    public constructor() {

        this.camera = new Vector2(512.0, 512.0);
    }

    // public constructor() {
    //
    //     const app = new PIXI.Application({
    //         width: 800, height: 600, backgroundColor: 0x000000, resolution: window.devicePixelRatio || 1,
    //     });
    //
    //     const container = new PIXI.Container();
    //
    //     app.stage.addChild(container);
    //
    //     // Create a new texture
    //     let texture = PIXI.Texture.from('assets/media/default_tileset.bmp');
    //
    //     let sprite = new PIXI.Sprite(texture);
    //     sprite.anchor.set(0);
    //     sprite.x = 0;
    //     sprite.y = 0;
    //
    //     let myGraph = new PIXI.Graphics();
    //     myGraph.lineStyle(1, 0xffffff, 0.5);
    //
    //     // Move it to the beginning of the line.
    //     myGraph.position.set(0, 0);
    //
    //     for (let y = 0; y <= 10; y++) {
    //         let yPosition = 16 * y;
    //         myGraph.moveTo(0, yPosition);
    //         myGraph.lineTo(304, yPosition);
    //     }
    //
    //     for (let x = 0; x <= 19; x++) {
    //         let xPosition = 16 * x;
    //         myGraph.moveTo(xPosition, 0);
    //         myGraph.lineTo(xPosition, 160);
    //     }
    //
    //     container.addChild(sprite);
    //     container.addChild(myGraph);
    //
    //     // Move container to the center
    //     container.x = 16;
    //     container.y = 16;
    //
    //     // Center bunny sprite in local container coordinates
    //     container.pivot.x = 0;
    //     container.pivot.y = 0;
    //
    //     document.getElementById("map-viewer-container").appendChild(app.view);
    //
    // }

    public update(): void {

    }

    public getMap(): Map {
        return this.map;
    }
}
