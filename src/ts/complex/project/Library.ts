import uuid = require('uuid');

export class Library {

    name: string;
    contents: Content[];

    constructor() {
    }
}

abstract class Content {

    readonly id: string;
    readonly type: string;

    name: string;
    metadata: { [field: string]: any };

    /**
     * Main constructor.
     *
     * @param idOrJson The internal ID of the content, or the JSON to load.
     * @param type The type of content.
     * @param name The formal name of the content.
     * @param metadata additional information packaged with the content.
     */
    protected constructor(idOrJson: string | { [field: string]: any }, type?: string, name?: string, metadata?: { [field: string]: any }) {
        if (typeof idOrJson == 'string') {

            this.id = idOrJson;
            this.type = type;
            this.name = name;
            this.metadata = metadata;

        } else if (typeof idOrJson == 'object') {

            this.type = idOrJson.type;

            this.id = idOrJson.id;
            if (this.id == null) {
                this.id = uuid.v4();
            }

            this.load(idOrJson);
        }
    }

    load(json: { [field: string]: any }): void {
        this.onLoad(json);
        this.name = json.name;
        this.metadata = json.metadata;
    }

    save(): { [field: string]: any } {
        let json: { [field: string]: any } = {};
        json.id = this.id;
        json.type = this.type;
        json.name = this.name;
        json.metadata = this.metadata;
        this.onSave(json);
        return json;
    }

    abstract onLoad(json: { [field: string]: any }): void;

    abstract onSave(json: { [field: string]: any }): void;
}

export class WallTile extends Content {

    definitions: WallTileDefinition;

    constructor(id: string, name: string, definitions: WallTileDefinition, metadata: { [field: string]: any } = {}) {

        super(id, "walltile", name, metadata);

        if (definitions == null) {
            definitions = {
                bottom_junction: 0,
                bottom_left_corner: 0,
                bottom_right_corner: 0,
                center: 0,
                dot: 0,
                horizontal: 0,
                horizontal_left_end: 0,
                horizontal_right_end: 0,
                left_junction: 0,
                right_junction: 0,
                top_junction: 0,
                top_left_corner: 0,
                top_right_corner: 0,
                vertical: 0,
                vertical_bottom_end: 0,
                vertical_top_end: 0
            };
        }
        this.definitions = definitions;
    }

    // @Override
    onLoad(json: { [p: string]: any }): void {

    }

    // @Override
    onSave(json: { [p: string]: any }): void {
    }
}

export interface WallTileDefinition {
    center: number;
    top_left_corner: number;
    top_right_corner: number;
    bottom_left_corner: number;
    bottom_right_corner: number;
    top_junction: number;
    bottom_junction: number;
    left_junction: number;
    right_junction: number;
    vertical_top_end: number;
    vertical: number;
    vertical_bottom_end: number;
    horizontal_left_end: number;
    horizontal: number;
    horizontal_right_end: number;
    dot: number;
}
