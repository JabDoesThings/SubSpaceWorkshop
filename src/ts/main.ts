import { LVL } from './io/LVLUtils';
import { LVZ } from './io/LVZUtils';
import { MapRenderer } from './simple/render/MapRenderer';
import { LVZCollection, LVZPackage } from './io/LVZ';
import { KeyListener } from './util/KeyListener';

function debugLVL() {

    let lvlFile = "assets/lvl/hz.lvl";
    
    let lvz: LVZCollection = new LVZCollection();
    let map = LVL.read(lvlFile);

    // let lvzPackage = LVZ.read("assets/lvz/thefield.lvz");
    // lvz = lvzPackage.inflate().collect();

    let view = new MapRenderer(map, lvz);

    let container
        = <HTMLDivElement> document.getElementsByClassName("map-viewport-canvas-container").item(0);
    view.init(container, 'viewport', true);

    // Screenshot button.
    new KeyListener("F12", () => {
        let renderer = view.app.renderer;
        let renderTexture = PIXI.RenderTexture.create({width: renderer.width, height: renderer.height});
        renderer.render(view.app.stage, renderTexture);
        let canvas = renderer.extract.canvas(renderTexture);
        let b64 = canvas.toDataURL('image/png');
        let link = document.createElement("a");
        link.setAttribute("href", b64);
        link.setAttribute("download", "screenshot.png");
        link.click();
    });
}

function debugLVZ() {

    let lvzFile = "assets/lvz/zone66.lvz";
    let lvzFile2 = "assets/lvz/zone66_.lvz";
    console.log("!!! Reading LVZ: " + lvzFile + "..");
    let compressedPackage = LVZ.read(lvzFile);
    // compressedPackage.print();

    console.log("!!! Decompressing LVZ: " + lvzFile + "..");
    let decompressedPackage = compressedPackage.inflate();
    // decompressedPackage.print();

    console.log("!!! Collecting LVZ Objects: " + lvzFile + "..");
    let collection = decompressedPackage.collect();
    // collection.print();

    console.log("!!! Applying Collected LVZ Objects to new LVZPackage..");
    let decompressedPackage2 = new LVZPackage(decompressedPackage.name);
    decompressedPackage2.apply(collection);
    // decompressedPackage2.print();

    console.log("!!! Packing new LVZPackage..");
    let compressedPackage2 = decompressedPackage2.pack();
    // compressedPackage2.print();

    console.log("!!! Writing new LVZCompressedPackage.");
    LVZ.write(compressedPackage2, lvzFile2);
}

export let start = function () {

    setTimeout(() => {
        console.log("### START ###");
        debugLVL();
    }, 10);
};

