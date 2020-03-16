import { MapRenderer } from './render/MapRenderer';
import { KeyListener } from '../util/KeyListener';
import { Session } from './Session';
import { TabAction, UITabEvent, UITabMenu } from './ui/UI';
import { CustomEventListener, CustomEvent } from './ui/CustomEventListener';
import * as PIXI from "pixi.js";

/**
 * The <i>SimpleEditor</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SimpleEditor extends CustomEventListener<EditorEvent> {

    sessions: Session[];
    renderer: MapRenderer;
    tabMenu: UITabMenu;
    activeSession: number;

    /**
     * Main constructor.
     *
     * @param sessions The Sessions to initially load.<br/>
     *     <b>NOTE</b>: The last Session will be set active.
     */
    constructor(...sessions: Session[]) {

        super();

        // @ts-ignore
        global.editor = this;

        this.sessions = [];

        this.tabMenu = new UITabMenu();
        for (let index = 0; index < sessions.length; index++) {

            let next = sessions[index];
            next.editor = this;
            next.tab = this.tabMenu.createTab(next._name, next._name);

            const _i = index;
            next.tab.addEventListener((event: UITabEvent) => {
                if (event.action == TabAction.SELECT) {
                    this.setActive(_i);
                }
            });
        }

        this.renderer = new MapRenderer();

        let vc = <HTMLDivElement> document.getElementById("viewport-container");
        vc.appendChild(this.tabMenu.element);

        let container = <HTMLDivElement> document.getElementsByClassName("viewport").item(0);
        this.renderer.init(container, 'viewport', true);

        // Screenshot button.
        new KeyListener("F12", () => {
            let renderer = this.renderer.app.renderer;
            let width = renderer.width;
            let height = renderer.height;
            let renderTexture = PIXI.RenderTexture.create({width: width, height: height});
            renderer.render(this.renderer.app.stage, renderTexture);
            let canvas = renderer.extract.canvas(renderTexture);
            let outCanvas = <HTMLCanvasElement> document.createElement('canvas');
            outCanvas.width = width;
            outCanvas.height = height;
            let ctx = outCanvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.drawImage(canvas, 0, 0);
            let b64 = outCanvas.toDataURL('image/png');
            let link = document.createElement("a");
            link.setAttribute("href", b64);
            link.setAttribute("download", "screenshot.png");
            link.click();
        });

        this.add(sessions);

        this.setActive(this.sessions.length - 1);
    }

    /**
     * Adds sessions to the editor.
     *
     * @param sessions
     *
     * @return Returns true if the action is cancelled.
     */
    add(sessions: Session[]): boolean {

        if (this.dispatch(<EditorSessionEvent> {
            eventType: "EditorSessionEvent",
            editor: this,
            action: EditorAction.SESSION_ADD,
            sessions: sessions,
            forced: false
        })) {
            return true;
        }

        for (let index = 0; index < sessions.length; index++) {
            let next = sessions[index];
            this.sessions.push(next);
        }

        this.dispatch(<EditorSessionEvent> {
            eventType: "EditorSessionEvent",
            editor: this,
            action: EditorAction.SESSION_ADDED,
            sessions: sessions,
            forced: true
        });
    }

    /**
     * Removes sessions from the editor.
     *
     * @param sessions
     * @param unload
     *
     * @return Returns true if the action is cancelled.
     */
    remove(sessions: Session[], unload: boolean = true): boolean {

        if (this.sessions.length === 0) {
            return false;
        }

        if (this.dispatch(<EditorSessionEvent> {
            eventType: "EditorSessionEvent",
            editor: this,
            action: EditorAction.SESSION_REMOVE,
            sessions: sessions,
            forced: false
        })) {
            return true;
        }

        let active = this.sessions[this.activeSession];

        let toRemove: Session[] = [];

        for (let index = 0; index < sessions.length; index++) {

            let next = sessions[index];

            if (unload && next.unload()) {
                continue;
            }

            toRemove.push(next);
        }

        if (toRemove.length === 0) {
            return false;
        }

        let contains = (session: Session): boolean => {
            for (let index = 0; index < toRemove.length; index++) {
                if (toRemove[index] === session) {
                    return true;
                }
            }
            return false;
        };

        let newArray: Session[] = [];

        for (let index = 0; index < this.sessions.length; index++) {
            let next = this.sessions[index];
            if (contains(next)) {
                continue;
            }
            newArray.push(next);
        }

        this.sessions = newArray;

        // Make sure to adjust the active index to the session that was active before the removal.
        let foundActive = false;
        for (let index = 0; index < this.sessions.length; index++) {
            if (this.sessions[index] === active) {
                this.activeSession = index;
                foundActive = true;
                break;
            }
        }

        // If the session is removed, set the last session active.
        if (!foundActive) {
            this.setActive(this.sessions.length - 1);
        }

        this.dispatch(<EditorSessionEvent> {
            eventType: "EditorSessionEvent",
            editor: this,
            action: EditorAction.SESSION_REMOVED,
            sessions: sessions,
            forced: true
        });
    }

    /**
     *
     * @param index
     *
     * @return Returns true if the action is cancelled.
     */
    setActive(index: number): boolean {

        if (this.dispatch(<EditorSessionEvent> {
            eventType: "EditorSessionEvent",
            editor: this,
            action: EditorAction.SESSION_ACTIVATE,
            forced: false,
            sessions: [this.sessions[index]]
        })) {
            return true;
        }

        this.activeSession = index;

        if (index == -1) {
            this.tabMenu.deselect();
            this.renderer.setSession(null);
        } else {
            let session = this.sessions[this.activeSession];
            if (!session.loaded) {
                session.tab.select();
                session.load();
            }
            this.renderer.setSession(session);
        }

        this.dispatch(<EditorSessionEvent> {
            eventType: "EditorSessionEvent",
            editor: this,
            action: EditorAction.SESSION_ACTIVATED,
            forced: true,
            sessions: [this.sessions[index]]
        });
    }
}

/**
 * The <i>EditorEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface EditorEvent extends CustomEvent {
    editor: SimpleEditor,
    action: EditorAction
}

/**
 * The <i>EditorSessionEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface EditorSessionEvent extends EditorEvent {
    sessions: Session[]
}

/**
 * The <i>EditorAction</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum EditorAction {
    SESSION_ACTIVATE = 'session-activate',
    SESSION_ACTIVATED = 'session-activated',
    SESSION_ADD = 'session-add',
    SESSION_ADDED = 'session-added',
    SESSION_REMOVE = 'session-remove',
    SESSION_REMOVED = 'session-removed'
}


