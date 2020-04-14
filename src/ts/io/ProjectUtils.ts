import { Project } from '../simple/Project';
import { Layer } from '../simple/layers/Layer';
import { TileData } from '../util/map/TileData';
import { Bitmap } from './Bitmap';
import { LVLMap } from './LVL';
import { LVL } from './LVLUtils';
import { Zip } from './Zip';

export class ProjectUtils {

    static read(path: string, onSuccess: (project: Project) => void, onError: (e: Error) => void = null) {

        if (path == null) {
            throw new Error('The path provided is null or undefined.');
        }

        if (onSuccess == null) {
            throw new Error('The onSuccess(project: Project) function given is null or undefined.');
        }

        let zip = new Zip();
        zip.read(path, () => {

                let project: Project = null;

                if (!zip.exists('project.json')) {
                    let error = new Error('The project.json file is missing.');
                    onError(error);
                    throw error;
                }

                let projectJson = JSON.parse(zip.get('project.json').toString());
                if (projectJson.layers == null) {
                    let error = new Error('The project.json file is missing the \'layers\' section.');
                    onError(error);
                    throw error;
                }

                // @ts-ignore
                let renderer: MapRenderer = global.editor.renderer;
                project = new Project(renderer, projectJson.name);

                // Load metadata for the project.
                if (projectJson.metadata != null) {
                    for (let o in projectJson.metadata) {
                        let key: string = <string> o;
                        let value = projectJson.metadata[key];
                        project.setMetadata(key, value);
                    }
                }

                // Load all layers in the project.
                let layers = project.layers;
                for (let o in projectJson.layers) {
                    let id = <string> o;
                    let next = projectJson.layers[id];

                    if (next.name == null) {
                        let error = new Error('The layer \'' + id + '\' does not have a name.');
                        onError(error);
                        throw error;
                    }

                    if (next.visible == null) {
                        let error = new Error('The layer \'' + id + '\' does not have the \'visible\' flag.');
                        onError(error);
                        throw error;
                    }

                    let layer = new Layer(layers, id, next.name);

                    layer.setVisible(next.visible);

                    // If the map has tiledata, load it.
                    if (next.tiledata != null) {
                        let tiledata: Buffer = <Buffer> zip.get(next.tiledata);
                        if (tiledata != null) {
                            try {
                                layer.tiles = ProjectUtils.readTileData(tiledata);
                            } catch (e) {
                                console.error('Failed to read \'' + next.path + '\'.');
                                console.error(e);
                            }
                        }
                    }

                    layer.setDirty(true);

                    // Load metadata for the layer.
                    if (next.metadata != null) {
                        for (let o in next.metadata) {
                            let key: string = <string> o;
                            let value = next.metadata[key];
                            layer.setMetadata(key, value);
                        }
                    }

                    layers.add(layer);
                }

                if (onSuccess != null) {
                    onSuccess(project);
                }
            },
            (error: Error) => {
                onError(error);
            });

        return;
    }

    static write(project: Project, path: string = null): void {

        if (project == null) {
            throw new Error('The project given is null or undefined.');
        }

        if (path == null) {
            path = project.path;
        }

        if (path == null) {
            throw new Error('The path provided and the path in the project'
                + ' given are null or undefined.');
        }

        let zip = new Zip();

        let json = ProjectUtils.writeProjectJSON(project);
        zip.set('project.json', JSON.stringify(json, null, 2));

        // Compile the tileset.
        if (project.tileset != null) {
            try {
                let source = project.editor.renderer.toCanvas(project.tileset.texture);
                zip.set('tileset.bmp', Bitmap.toBuffer(source, project.tileset.bitCount));
            } catch (e) {
                console.error("Failed to write project tileset to buffer.");
                console.error(e);
            }
        }

        // Compile the layers.
        let layers = project.layers.layers;
        if (layers.length !== 0) {
            for (let index = 0; index < layers.length; index++) {
                let next = layers[index];
                let data = next.tiles;
                if (data != null && data.getTileCount() !== 0) {
                    let id = next.getId() + '.tiledata';
                    try {
                        zip.set(id, ProjectUtils.writeTileData(data));
                    } catch (e) {
                        console.error('Failed to compile TILEDATA: ' + id);
                        console.error(e);
                    }
                }
            }
        }

        zip.write(path);
    }

    static readTileData(buffer: Buffer): TileData {

        let offset = 0;

        let header = '';
        header += String.fromCharCode(buffer.readUInt8(offset++));
        header += String.fromCharCode(buffer.readUInt8(offset++));
        header += String.fromCharCode(buffer.readUInt8(offset++));
        header += String.fromCharCode(buffer.readUInt8(offset++));

        if (header !== 'STIL') {
            throw new Error('The TILEDATA buffer given is not a valid buffer.'
                + ' (Invalid header)');
        }

        let width = buffer.readUInt16LE(offset);
        offset += 2;

        if (width > 1024) {
            throw new Error('The width of the TILEDATA buffer is too big.'
                + ' (max: 1024, given: ' + width + ')');
        } else if (width < 0) {
            throw new Error('The width of the TILEDATA buffer is too small.'
                + ' (min: 1, given: ' + width + ')');
        }

        let height = buffer.readUInt16LE(offset);
        offset += 2;

        if (height > 1024) {
            throw new Error('The height of the TILEDATA buffer is too big.'
                + ' (max: 1024, given: ' + height + ')');
        } else if (height < 0) {
            throw new Error('The height of the TILEDATA buffer is too small.'
                + ' (min: 1, given: ' + height + ')');
        }

        let count = buffer.readUInt32LE(offset);
        offset += 4;

        // Make sure that the count is not negative.
        if (count < 0) {
            throw new Error('The tile-count of the TILEDATA buffer is negative.');
        }

        // Construct the expanded array to populate with tile data.
        let data: number[][] = [];
        for (let x = 0; x < width; x++) {
            data[x] = [];
            for (let y = 0; y < height; y++) {
                data[x][y] = 0;
            }
        }

        // If the TILEDATA is not empty, populate the data array.
        if (count !== 0) {

            for (let index = 0; index < count; index++) {

                let i = buffer.readInt32LE(offset);
                offset += 4;
                let tile = (i >> 24 & 0x00ff);
                let y = (i >> 12) & 0x03FF;
                let x = i & 0x03FF;
                data[x][y] = tile;
            }
        }

        return new TileData(data);
    }

    static writeTileData(data: TileData): Buffer {

        let tiles: Tile[] = [];

        // Go through and flatten the raw array into non-zero-based tile profiles.
        for (let y = 0; y < data.height; y++) {
            for (let x = 0; x < data.width; x++) {
                let next = data.tiles[x][y];
                if (next !== 0) {
                    tiles.push({x: x, y: y, id: next});
                }
            }
        }

        // (Header) + (Number of tiles) + (Tiles)
        let buffer = Buffer.alloc(12 + (tiles.length * 4));
        let offset = 0;

        // Write the header.
        buffer.writeUInt8('S'.charCodeAt(0), offset++);
        buffer.writeUInt8('T'.charCodeAt(0), offset++);
        buffer.writeUInt8('I'.charCodeAt(0), offset++);
        buffer.writeUInt8('L'.charCodeAt(0), offset++);

        // Width of TileData.
        buffer.writeUInt16LE(data.width, offset);
        offset += 2;
        // Height of TileData.
        buffer.writeUInt16LE(data.height, offset);
        offset += 2;
        // Tile-Count of TileData.
        buffer.writeUInt32LE(tiles.length, offset);
        offset += 4;

        // Go through all tile profiles, convert them to values and store them in
        //   in the buffer.
        for (let index = 0; index < tiles.length; index++) {

            // Format the next tile to be stored in the buffer.
            let next = tiles[index];
            let int = ((next.id & 0x00ff) << 24) | ((next.y & 0x03FF) << 12) | (next.x & 0x03FF);

            // Write the next tile as a integer value.
            buffer.writeInt32LE(int, offset);
            offset += 4;
        }

        return buffer;
    }

    private static writeProjectJSON(project: Project): { [id: string]: any } {

        if (project == null) {
            throw new Error('The project given is null or undefined.');
        }

        let object: { [id: string]: any } = {};
        object.name = project._name;
        object.layers = {};

        let layers = project.layers.layers;
        for (let index = 0; index < layers.length; index++) {
            let next = layers[index];
            let id = next.getId();
            object.layers[id] = ProjectUtils.writeLayerJSON(next);
        }

        object.metadata = project.getMetadataTable();

        return object;
    }

    private static writeLayerJSON(layer: Layer): { [id: string]: any } {

        let object: { [id: string]: any } = {};

        object.name = layer.getName();
        object.visible = layer.isVisible();
        object.locked = layer.isLocked();

        let tileCount = layer.tiles.getTileCount();
        if (tileCount !== 0) {
            object.tiledata = layer.getId() + '.tiledata';
        }

        object.metadata = layer.getMetadataTable();

        return object;
    }

    static export(project: Project, path: string): void {

        let tiles = new TileData();
        for (let x = 0; x < 1024; x++) {
            for (let y = 0; y < 1024; y++) {
                let id = project.layers.getTile(x, y);
                if (id === -1) {
                    id = 0;
                }
                tiles.set(x, y, id, null, false);
            }
        }

        let map = new LVLMap('name', tiles, project.tileset);
        LVL.write(map, path);
    }
}

export interface ProjectFile {
    path: string,
    data: Buffer
}

interface Tile {
    x: number,
    y: number,
    id: number
}
