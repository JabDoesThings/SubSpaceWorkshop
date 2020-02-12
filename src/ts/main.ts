import { MapViewer } from './map/MapViewer';

import { Map } from './map/Map';
import { RasterMapObject } from './map/objects/RasterMapObject';

let mapViewer: MapViewer;

export let start = function () {

    console.log("start.");

    let map = new Map("Map");

    let layer: RasterMapObject = <RasterMapObject> map.getLayer(0);
    layer.setTile(512, 512, 1);

    let htmlContainer: HTMLElement = document.getElementById("map-viewer-container");
    mapViewer = new MapViewer(htmlContainer, map);
};

