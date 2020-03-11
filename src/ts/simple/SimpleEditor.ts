import { MapRenderer } from './render/MapRenderer';
import { KeyListener } from '../util/KeyListener';
import { Session } from './Session';
import { TabAction, UITabEvent, UITabMenu } from './ui/UI';

/**
 * The <i>SimpleEditor</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SimpleEditor {

    sessions: Session[];
    renderer: MapRenderer;
    activeSession: number;

    private tabMenu: UITabMenu;

    constructor(sessions: Session[]) {

        // @ts-ignore
        global.editor = this;

        this.sessions = sessions;

        this.tabMenu = new UITabMenu();
        for (let index = 0; index < sessions.length; index++) {

            let next = sessions[index];
            next.editor = this;
            next.tab = this.tabMenu.createTab(next._name, next._name);

            const _i = index;
            next.tab.addEventListener((event: UITabEvent) => {
                if (event.action == TabAction.SELECT) {
                    this.setActiveSession(_i);
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

        this.setActiveSession(this.sessions.length - 1);
    }

    setActiveSession(index: number) {

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
    }
}
