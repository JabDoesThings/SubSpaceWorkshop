import { MapViewer } from './map/MapViewer';

import { Map } from './map/Map';
import { RasterMapObject } from './map/objects/RasterMapObject';

let mapViewer: MapViewer;

export let start = function () {

    console.log("start.");

    let map = new Map("Map");

    let object = new RasterMapObject(map, 1024, 1024, "basic");
    object.setTile(512, 512, 170);
    object.setTile(512, 513, 171);
    map.addLayer(object);

    let htmlContainer: HTMLElement = document.getElementById("map-viewer-container");
    mapViewer = new MapViewer(htmlContainer, map);
};

