import { LVL } from './map/lvl/LVLUtils';
import { LVZ } from './map/lvz/LVZUtils';
import { Renderer } from './Renderer';
import { LVZPackage } from './map/lvz/LVZ';

function debugLVL() {

    let container = document.getElementById("map-viewer-container");

    let arena = "hz";
    let lvlFile = "assets/lvl/" + arena + ".lvl";
    let lvlFile2 = "assets/lvl/" + arena + "_.lvl";

    let map = LVL.read(lvlFile);

    // let lvzPackage = LVZ.read("assets/lvz/thefield.lvz");
    // let lvz = lvzPackage.inflate().collect();

    let renderer = new Renderer(container, map);

    setTimeout(() => {
        map.fill(217, 32, 32, 127, 127);
    }, 5000);
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

    console.log("start.");

    debugLVL();
    // debugLVZ();
    // debugEditor();
};


