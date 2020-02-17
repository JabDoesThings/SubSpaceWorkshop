import { MapViewer } from './map/MapViewer';

import { Map } from './map/Map';
import { MapUtils } from './map/MapUtils';
import { LVZ } from './map/lvz/LVZUtils';
import { LVZPackage } from './map/lvz/LVZ';

let mapViewer: MapViewer;

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

function debugEditor() {

    let map = new Map("Map");
    MapUtils.read(map, "assets/lvl/trench2.lvl");

    let htmlContainer: HTMLElement = document.getElementById("map-viewer-container");
    mapViewer = new MapViewer(htmlContainer, map);
}

export let start = function () {

    console.log("start.");

    debugLVZ();

    // debugEditor();
};


