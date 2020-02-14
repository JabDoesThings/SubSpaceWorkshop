import { MapViewer } from './map/MapViewer';

import { Map } from './map/Map';
import { MapUtils } from './map/MapUtils';
import { LVZ_IO } from './map/lvz/LVZ_IO';

let mapViewer: MapViewer;

function debugLVZ() {

    let lvzFile = "assets/lvz/thefield2.lvz";
    console.log("Reading LVZ: " + lvzFile + "..");
    let compressedPackage = LVZ_IO.read(lvzFile);
    compressedPackage.print();

    console.log("Decompressing LVZ: " + lvzFile + "..");
    let decompressedPackage = compressedPackage.deflate();
    decompressedPackage.print();

    console.log("Decompiling LVZ: " + lvzFile + "..");
    let collection = decompressedPackage.decompile();
    collection.print();
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

    debugEditor();
};

