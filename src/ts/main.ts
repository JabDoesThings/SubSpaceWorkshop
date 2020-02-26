import { LVL } from './map/lvl/LVLUtils';
import { LVZ } from './map/lvz/LVZUtils';
import { Renderer } from './map/render/Renderer';
import { LVZPackage } from './map/lvz/LVZ';
import { KeyListener } from './util/KeyListener';
import * as fs from 'fs';
import InteractionEvent = PIXI.interaction.InteractionEvent;

function debugLVL() {

    let container = document.getElementById("map-viewer-container");

    let arena = "zone66";
    let lvlFile = "assets/lvl/" + arena + ".lvl";
    let lvlFile2 = "assets/lvl/" + arena + "3.lvl";

    let map = LVL.read(lvlFile);
    LVL.write(map, lvlFile2);

    console.log("save");

    // let lvzPackage = LVZ.read("assets/lvz/thefield.lvz");
    // let lvz = lvzPackage.inflate().collect();

    let view = new Renderer(container, map);

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

    // setTimeout(() => {
    //     map.fill(217, 32, 32, 127, 127);
    // }, 5000);
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

    console.log("### START ###");

    debugLVL();
    // debugLVZ();
    // debugEditor();
};


