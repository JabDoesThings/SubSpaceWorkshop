import { MapViewer } from './map/MapViewer';

let mapViewer: MapViewer;

export let start = function () {
    console.log("start.");
    mapViewer = new MapViewer();
};

