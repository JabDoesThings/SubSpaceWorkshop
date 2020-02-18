import { LVL } from './map/lvl/LVLUtils';
import { LVZ } from './map/lvz/LVZUtils';
import { MapView } from './map/MapView';
import { LVZPackage } from './map/lvz/LVZ';

function debugLVL() {

    let lvlFile = "assets/lvl/_bzw.lvl";
    let lvlFile2 = "assets/lvl/_bzw_.lvl";

    let map = LVL.read(lvlFile);

    let mapViewer = new MapView(map, document.getElementById("map-viewer-container"));

    // LVL.write(map, lvlFile2);
}

function debugLVZ() {

    let lvzFile = "assets/lvz/thefield2.lvz";
    let lvzFile2 = "assets/lvz/thefield2_copy.lvz";
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


