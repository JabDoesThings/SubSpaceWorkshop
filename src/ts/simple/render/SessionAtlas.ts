import { Texture } from "pixi.js";
import { MapSprite } from './MapSprite';
import { CustomEventListener, CustomEvent } from '../ui/CustomEventListener';
import { Dirtable } from '../../util/Dirtable';

/**
 * The <i>SessionAtlas</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SessionAtlas extends CustomEventListener<CustomEvent> implements Dirtable {

    private readonly textures: { [id: string]: TextureAtlas };

    private dirty: boolean;

    private readonly tListener: (event: TextureAtlasEvent) => void | boolean;

    /** Main constructor. */
    constructor() {
        super();
        this.textures = {};
        this.tListener = (event => this.dispatch(event));
        this.dirty = true;
    }

    clone(): SessionAtlas {

        let sessionAtlas = new SessionAtlas();
        for (let id in this.textures) {
            sessionAtlas.textures[id] = this.textures[id].clone();
            sessionAtlas.textures[id].addEventListener(sessionAtlas.tListener);
        }

        sessionAtlas.setDirty(true);
        return sessionAtlas;
    }

    /** Updates all sprites registered in the atlas. */
    update(): void {

        for (let id in this.textures) {
            this.textures[id].update();
        }
    }

    /**
     * Removes a texture and all sprites assigned to the texture.
     *
     * @param textureId The ID to assign the texture.<br/>
     * <b>NOTE</b>: The ID will be lower-cased.
     */
    removeTexture(textureId: string): boolean {

        let texture = this.textures[textureId.toLowerCase()];

        if (texture == null) {
            return false;
        }

        texture.removeEventListener(this.tListener);

        this.textures[textureId.toLowerCase()] = null;
        this.dirty = true;

        let textures: { [id: string]: TextureAtlas } = {};
        textures[textureId] = texture;

        this.dispatch(<SessionAtlasEvent> {
            eventType: 'SessionAtlasEvent',
            sessionAtlas: this,
            action: AtlasAction.REMOVE_TEXTURES,
            textures: textures,
            forced: true
        });

        return false;
    }

    /**
     * Clears all textures and sprites assigned to the texture in the atlas.
     */
    clear(): boolean {

        for (let textureId in this.textures) {
            this.textures[textureId] = null;
        }

        this.dirty = true;

        this.dispatch(<SessionAtlasEvent> {
            eventType: 'SessionAtlasEvent',
            sessionAtlas: this,
            action: AtlasAction.REMOVE_TEXTURES,
            textures: this.textures,
            forced: true
        });

        return false;
    }

    /**
     * @param textureId The ID of the texture. <br/>
     * <b>NOTE</b>: The ID will be lower-cased.
     * @return Returns the texture assigned to the id.
     */
    getTextureAtlas(textureId: string): TextureAtlas {
        return this.textures[textureId.toLowerCase()];
    }

    /**
     * Assigns a texture to the ID given.
     *
     * @param texture
     */
    setTextureAtlas(texture: TextureAtlas): boolean {

        if (texture == null) {
            throw new Error('The TextureAtlas given is null or undefined.');
        }

        this.removeTexture(texture.id);

        this.textures[texture.id] = texture;
        texture.addEventListener(this.tListener);

        this.dirty = true;

        let textures: { [id: string]: TextureAtlas } = {};
        textures[texture.id] = texture;

        this.dispatch(<SessionAtlasEvent> {
            eventType: 'SessionAtlasEvent',
            sessionAtlas: this,
            action: AtlasAction.SET_TEXTURES,
            textures: textures,
            forced: true
        });

        return false;
    }

    getTextureAtlases(): { [id: string]: TextureAtlas } {
        return this.textures;
    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    getSpriteById(id: string): MapSprite {

        id = id.toLowerCase();

        for (let textureId in this.textures) {
            let nextTexture = this.textures[textureId];
            let sprite = nextTexture.getSpriteById(id);
            if (sprite != null) {
                return sprite;
            }
        }

        return null;
    }
}

export class TextureAtlas extends CustomEventListener<TextureAtlasEvent> {

    readonly id: string;

    texture: Texture;
    sprites: { [id: string]: MapSprite };

    constructor(id: string, texture: Texture) {

        super();

        this.id = id.toLowerCase();
        this.sprites = {};
        this.setTexture(texture);
    }

    clone(): TextureAtlas {

        let textureAtlas = new TextureAtlas(this.id, this.texture);
        for (let id in this.sprites) {
            textureAtlas.sprites[id] = this.sprites[id].clone();
        }

        return textureAtlas;
    }

    update(): void {
        for (let id in this.sprites) {
            this.sprites[id].update();
        }
    }

    addSprite(id: string, sprite: MapSprite): void {
        id = id.toLowerCase();
        sprite.id = id;
        this.sprites[id] = sprite;

        let sprites: { [id: string]: MapSprite } = {};
        sprites[id] = sprite;

        this.dispatch({
            eventType: 'TextureAtlasEvent',
            textureAtlas: this,
            action: TextureAtlasAction.SET_SPRITES,
            sprites: sprites,
            forced: true
        });

        this.applySprite(sprite);
    }

    private applySprite(sprite: MapSprite) {

        if (sprite.dynamic) {
            if (this.texture != null) {
                sprite.frameWidth = this.texture.width / sprite.framesX;
                sprite.frameHeight = this.texture.height / sprite.framesY;
            } else {
                sprite.frameWidth = -1;
                sprite.frameHeight = -1;
            }
        }

        sprite.reset();
        sprite.setTexture(this.texture);
        sprite.setDirty(true);
    }

    removeSprite(id: string): void {
        let sprite = this.sprites[id.toLowerCase()];
        this.sprites[id.toLowerCase()] = null;

        let sprites: { [id: string]: MapSprite } = {};
        sprites[id] = sprite;

        this.dispatch({
            eventType: 'TextureAtlasEvent',
            textureAtlas: this,
            action: TextureAtlasAction.REMOVE_SPRITES,
            sprites: sprites,
            forced: true
        });
    }

    setTexture(texture: Texture): void {

        this.texture = texture;

        let apply = (): void => {

            for (let id in this.sprites) {
                let sprite = this.sprites[id];
                this.applySprite(sprite);
            }

            this.dispatch({
                eventType: 'TextureAtlasEvent',
                textureAtlas: this,
                action: TextureAtlasAction.UPDATE,
                sprites: this.sprites,
                forced: true
            });
        };

        if (this.texture != null) {
            if (this.texture.valid) {
                apply();
            } else {
                this.texture.addListener('update', () => {
                    apply();
                });
            }
        } else {
            apply();
        }
    }

    clear(): boolean {

        for (let id in this.sprites) {
            this.sprites[id].setTexture(null);
        }

        this.dispatch({
            eventType: 'TextureAtlasEvent',
            textureAtlas: this,
            action: TextureAtlasAction.CLEAR_SPRITES,
            sprites: this.sprites,
            forced: true
        });

        this.sprites = {};

        return false;
    }

    getSpriteById(id: string): MapSprite {
        return this.sprites[id.toLowerCase()];
    }
}

export interface SessionAtlasEvent extends CustomEvent {
    sessionAtlas: SessionAtlas,
    action: AtlasAction,
    textures: { [id: string]: TextureAtlas }
}

export interface TextureAtlasEvent extends CustomEvent {
    textureAtlas: TextureAtlas,
    action: TextureAtlasAction,
    sprites: { [id: string]: MapSprite },
}

export enum TextureAtlasAction {
    UPDATE = 'update',
    REMOVE = 'remove',
    SET_SPRITES = 'set-sprites',
    REMOVE_SPRITES = 'remove-sprites',
    CLEAR_SPRITES = 'clear-sprites',
}

export enum AtlasAction {
    CLEAR = 'clear',
    SET_TEXTURES = 'set-textures',
    REMOVE_TEXTURES = 'remove-textures',
}
