import { MapViewer } from './map/MapViewer';

import { Map } from './map/Map';
import { RasterMapObject } from './map/objects/RasterMapObject';

let mapViewer: MapViewer;

export let start = function () {

    console.log("start.");

    let map = new Map("Map");

    let object = new RasterMapObject(map, 1024, 1024, "basic");
    object.setTile(0, 0, 170);
    object.setTile(0, 1, 171);
    map.addLayer(object);

    let htmlContainer: HTMLElement = document.getElementById("map-viewer-container");
    mapViewer = new MapViewer(htmlContainer, map);
};

