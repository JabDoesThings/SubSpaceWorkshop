import { MapRenderer } from './MapRenderer';
import { Radar } from '../../common/Radar';

export class MapRadar extends Radar {

    constructor(view: MapRenderer) {
        super(view);
    }

    // @Override
    async draw() {

        let session = (<MapRenderer> this.view).session;
        if (session == null) {
            return;
        }
        let map = session.map;

        let ctx = this.drawCanvas.getContext('2d');

        // Clear the radar to its clear color.
        ctx.fillStyle = '#010201';
        ctx.fillRect(0, 0, 1024, 1024);

        if (map == null) {
            return;
        }

        let tileset = map.tileset;

        for (let y = 0; y < 1024; y++) {
            for (let x = 0; x < 1024; x++) {
                let tileId = map.getTile(x, y);
                if (tileId != 0) {

                    if (tileId <= 190) {
                        if (tileset != null) {
                            ctx.fillStyle = tileset.tileColor[tileId];
                        } else {
                            ctx.fillStyle = '#eeeeee';
                        }
                        ctx.fillRect(x, y, 1, 1);
                    } else if (tileId == 216) {
                        ctx.fillStyle = '#4b3225';
                        ctx.fillRect(x, y, 1, 1);
                    } else if (tileId == 217) {
                        ctx.fillStyle = '#4b3225';
                        ctx.fillRect(x, y, 2, 2);
                    } else if (tileId == 218) {
                        ctx.fillStyle = '#4b3225';
                        ctx.fillRect(x, y, 1, 1);
                    } else if (tileId == 219) {
                        ctx.fillStyle = '#4b4b4b';
                        ctx.fillRect(x, y, 6, 6);
                    } else if (tileId == 220) {
                        ctx.fillStyle = '#710066';
                        ctx.fillRect(x, y, 5, 5);
                    } else {
                        ctx.fillStyle = '#d500d5';
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        }
    }
}

