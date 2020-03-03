import * as fs from "fs";
import * as PIXI from "pixi.js";
import Filter = PIXI.Filter;
import InteractionEvent = PIXI.interaction.InteractionEvent;
import { UpdatedObject } from '../util/UpdatedObject';
import { Path, PathCoordinates, PathMode } from '../util/Path';
import { KeyListener } from '../util/KeyListener';
import { Vector2 } from 'three';
import { LVL } from '../io/LVLUtils';
import { Background } from './Background';

const Stats = require("stats.js");

/**
 * The <i>Renderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class Renderer extends UpdatedObject {

    static fragmentSrc = fs.readFileSync("assets/glsl/pixi_chroma.frag").toString();
    static chromaFilter = new Filter(undefined, Renderer.fragmentSrc, undefined);

    app: PIXI.Application;
    camera: Camera;
    stats: Stats;
    events: RenderEvents;

    background: Background;

    protected constructor() {

        super();

        this.camera = new Camera();
    }

    init(container: HTMLElement, id: string = 'viewport', stats: boolean): void {

        PIXI.settings.RESOLUTION = window.devicePixelRatio;
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        PIXI.settings.RENDER_OPTIONS.antialias = false;
        PIXI.settings.RENDER_OPTIONS.forceFXAA = false;
        PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF;
        PIXI.settings.SPRITE_MAX_TEXTURES = 1024;

        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
            antialias: false,
            forceFXAA: false,
            clearBeforeRender: true
        });

        this.app.ticker.add((delta) => {

            if (this.stats != null) {
                this.stats.begin();
            }

            this.updateCamera(delta);

            if (this.background.visible && this.camera.isDirty()) {
                this.background.update();
            }

            this.onPreUpdate(delta);
            this.update(delta);

            if (this.stats != null) {
                this.stats.end();
            }
        });

        this.app.view.id = id;
        this.app.stage.interactive = true;

        if (stats) {
            this.initStats();
        }

        this.events = new RenderEvents(this);
        this.background = new Background(this);

        let stage = this.app.stage;
        stage.addChild(this.background);

        this.onInit();

        container.appendChild(this.app.view);

        let resize = () => {

            // Resize the renderer
            let width = container.clientWidth;
            let height = container.clientHeight;
            this.app.renderer.resize(width - 2, height - 2);
            this.setDirty(true);

            let $leftTabMenu = $('#editor-left-tab-menu');
            $leftTabMenu.css({top: (window.innerHeight - 49) + 'px'});
        };

        resize();

        // Listen for window resize events
        window.addEventListener('resize', resize);

        this.setDirty(true);
    }

    private initStats(): void {
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style.left = "0px";
        this.stats.dom.style.bottom = "0px";
        this.app.view.appendChild(this.stats.dom);
    }

    private updateCamera(delta: number): void {
        let sw = this.app.view.width;
        let sh = this.app.view.height;

        let cPos = this.camera.getPosition();
        let cx = cPos.x * 16;
        let cy = cPos.y * 16;

        this.camera.bounds.x = cx - sw / 2.0;
        this.camera.bounds.y = cy - sh / 2.0;
        this.camera.bounds.width = sw;
        this.camera.bounds.height = sh;
        this.camera.update(delta);
    }

    protected abstract onInit(): void;

    protected abstract onPreUpdate(delta: number): void;
}

export class RenderEvents {

    readonly mouseListeners: ((event: MapMouseEvent) => void)[];

    readonly renderer: Renderer;

    constructor(renderer: Renderer) {

        this.renderer = renderer;

        this.mouseListeners = [];

        let toMapSpace = (e: InteractionEvent): MapSpace => {
            let camera = this.renderer.camera;
            let sx = e.data.global.x;
            let sy = e.data.global.y;
            let sw = this.renderer.app.screen.width;
            let sh = this.renderer.app.screen.height;
            return camera.toMapSpace(sx, sy, sw, sh);
        };

        let down = false;

        let onButtonDown = (e: InteractionEvent) => {
            down = true;
            this.dispatch({data: toMapSpace(e), type: MapMouseEventType.DOWN, button: e.data.button});
        };

        let onButtonMove = (e: InteractionEvent) => {
            this.dispatch({
                data: toMapSpace(e),
                type: down ? MapMouseEventType.DRAG : MapMouseEventType.HOVER,
                button: e.data.button
            });
        };

        let onButtonUp = (e: InteractionEvent) => {
            down = false;
            this.dispatch({data: toMapSpace(e), type: MapMouseEventType.UP, button: e.data.button});
        };
        let onButtonOver = (e: InteractionEvent) => {
            this.dispatch({data: toMapSpace(e), type: MapMouseEventType.ENTER, button: e.data.button});
        };
        let onButtonOut = (e: InteractionEvent) => {
            this.dispatch({data: toMapSpace(e), type: MapMouseEventType.EXIT, button: e.data.button});
        };

        this.renderer.app.stage.on('pointerdown', onButtonDown)
            .on('pointerup', onButtonUp)
            .on('pointerupoutside', onButtonUp)
            .on('pointerover', onButtonOver)
            .on('pointerout', onButtonOut)
            .on('pointermove', onButtonMove);

        this.renderer.app.view.addEventListener('wheel', (e: WheelEvent) => {

            console.log(e);

            let sx = e.offsetX;
            let sy = e.offsetY;
            let sw = this.renderer.app.screen.width;
            let sh = this.renderer.app.screen.height;

            let mapSpace = this.renderer.camera.toMapSpace(sx, sy, sw, sh);

            let type = e.deltaY > 0 ? MapMouseEventType.WHEEL_UP : MapMouseEventType.WHEEL_DOWN;

            this.dispatch({data: mapSpace, type: type, button: 1});
            return false;
        }, false);
    }

    dispatch(event: MapMouseEvent): void {
        if (this.mouseListeners.length != 0) {
            for (let index = 0; index < this.mouseListeners.length; index++) {
                this.mouseListeners[index](event);
            }
        }
    }

    addMouseListener(listener: (event: MapMouseEvent) => void): void {

        // Make sure that the renderer doesn't have the listener.
        if (this.hasMouseListener(listener)) {
            throw new Error("The mouse listener is already registered.");
        }

        this.mouseListeners.push(listener);
    }

    removeMouseListener(listener: (event: MapMouseEvent) => void): void {

        // Make sure that the renderer has the listener.
        if (!this.hasMouseListener(listener)) {
            throw new Error("The mouse listener is not registered.");
        }

        // If the listener is the last entry, simply pop it from the array.
        if (this.mouseListeners[this.mouseListeners.length - 1] === listener) {
            this.mouseListeners.pop();
            return;
        }

        let toAdd: ((event: MapMouseEvent) => void)[] = [];

        // Go through each entry until the one to remove is found.
        while (true) {

            let next = this.mouseListeners.pop();
            if (next === listener) {
                break;
            }

            toAdd.push(next);
        }

        // Add them back in reverse order to preserve the original sequence.
        for (let index = toAdd.length - 1; index >= 0; index--) {
            this.mouseListeners.push(toAdd[index]);
        }
    }

    hasMouseListener(listener: (event: MapMouseEvent) => void) {

        for (let index = 0; index < this.mouseListeners.length; index++) {

            let next = this.mouseListeners[index];

            if (next === listener) {
                return true;
            }
        }

        return false;
    }
}

/**
 * The <i>Camera</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Camera extends UpdatedObject {

    path: Path;
    alt: KeyListener;
    bounds: PIXI.Rectangle;
    coordinateMin: number;
    coordinateMax: number;

    private position: { x: number, y: number };
    private upArrowListener: KeyListener;
    private downArrowListener: KeyListener;
    private leftArrowListener: KeyListener;
    private rightArrowListener: KeyListener;
    private wListener: KeyListener;
    private sListener: KeyListener;
    private aListener: KeyListener;
    private dListener: KeyListener;
    private scale: number;
    private shift: boolean;

    /**
     * Main constructor.
     */
    constructor() {

        super();

        this.path = new Path();

        this.shift = false;

        this.setRequireDirtyToUpdate(false);

        this.coordinateMin = 0;
        this.coordinateMax = LVL.MAP_LENGTH;

        // Set the initial position to be the center of the map with the default scale.
        this.position = new Vector2(this.coordinateMax / 2, this.coordinateMax / 2);
        this.scale = 1.0;

        this.bounds = new PIXI.Rectangle(0, 0, 0, 0);

        this.upArrowListener = new KeyListener("ArrowUp");
        this.downArrowListener = new KeyListener("ArrowDown");
        this.leftArrowListener = new KeyListener("ArrowLeft");
        this.rightArrowListener = new KeyListener("ArrowRight");

        this.wListener = new KeyListener("w");
        this.sListener = new KeyListener("s");
        this.aListener = new KeyListener("a");
        this.dListener = new KeyListener("d");

        new KeyListener("1", () => {
            this.pathTo({x: 0, y: 0});
        });
        new KeyListener("2", () => {
            this.pathTo({x: this.coordinateMax, y: 0});
        });
        new KeyListener("3", () => {
            this.pathTo({x: 0, y: this.coordinateMax});
        });
        new KeyListener("4", () => {
            this.pathTo({x: this.coordinateMax, y: this.coordinateMax});
        });
        new KeyListener("5", () => {
            this.pathTo({x: this.coordinateMax / 2, y: this.coordinateMax / 2});
        });
        new KeyListener("Shift", () => {
            this.shift = true;
        }, null, () => {
            this.shift = false;
        });
        this.alt = new KeyListener('Alt');

        // Make sure anything dependent on the camera being dirty renders on the first
        // render call.
        this.setDirty(true);
    }

    // @Override
    onUpdate(delta: number): boolean {

        this.path.update();

        let speed = 1;
        if (this.shift) {
            speed = 2;
        }

        let up = this.upArrowListener.isDown || this.wListener.isDown;
        let down = this.downArrowListener.isDown || this.sListener.isDown;
        let left = this.leftArrowListener.isDown || this.aListener.isDown;
        let right = this.rightArrowListener.isDown || this.dListener.isDown;

        if (up != down) {

            if (up) {
                this.position.y -= speed;
                this.setDirty(true);
            }

            if (down) {
                this.position.y += speed;
                this.setDirty(true);
            }

            if (this.position.y <= this.coordinateMin) {
                this.position.y = this.coordinateMin;
            } else if (this.position.y >= this.coordinateMax) {
                this.position.y = this.coordinateMax;
            }
        }

        if (left != right) {

            if (left) {
                this.position.x -= speed;
                this.setDirty(true);
            }

            if (right) {
                this.position.x += speed;
                this.setDirty(true);
            }

            if (this.position.x <= this.coordinateMin) {
                this.position.x = this.coordinateMin;
            } else if (this.position.x >= this.coordinateMax) {
                this.position.x = this.coordinateMax;
            }
        }

        return true;
    }

    toMapSpace(sx: number, sy: number, sw: number, sh: number): MapSpace {
        let cx = this.position.x * 16.0;
        let cy = this.position.y * 16.0;
        let mx = Math.floor(cx + (sx - (sw / 2.0)));
        let my = Math.floor(cy + (sy - (sh / 2.0)));
        let tx = Math.floor(mx / 16.0);
        let ty = Math.floor(my / 16.0);
        return {x: mx, y: my, tileX: tx, tileY: ty};
    };

    pathTo(coordinates: PathCoordinates, ticks: number = 1, mode: PathMode = PathMode.LINEAR) {

        let callback = (x: number, y: number): void => {
            this.position.x = x;
            this.position.y = y;
            this.setDirty(true);
        };

        this.path.to(coordinates, [callback], ticks, mode);
    }

    /**
     * @Return Returns a copy of the position of the camera.
     * <br><b>NOTE:</b> Modifying this copy will not modify the position of the camera.
     */
    getPosition(): Vector2 {
        return new Vector2(this.position.x, this.position.y);
    }

    /**
     * @return Returns the scale of the camera.
     */
    getScale(): number {
        return this.scale;
    }

    /**
     * Sets the scale of the camera.
     *
     * @param value The value to set.
     */
    setScale(value: number): void {
        this.scale = value;
        this.setDirty(true);
    }
}

export interface MapMouseEvent {
    type: MapMouseEventType,
    data: MapSpace,
    button: number
}

export interface MapSpace {
    tileX: number,
    tileY: number,
    x: number,
    y: number
}

export enum MapMouseEventType {
    DOWN = 'down',
    UP = 'up',
    DRAG = 'drag',
    HOVER = 'hover',
    ENTER = 'enter',
    EXIT = 'exit',
    WHEEL_UP = 'wheel_up',
    WHEEL_DOWN = 'wheel_down'
}
