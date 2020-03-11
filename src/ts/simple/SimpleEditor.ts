import { MapRenderer } from './render/MapRenderer';
import { KeyListener } from '../util/KeyListener';
import { Session } from './Session';

/**
 * The <i>SimpleEditor</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SimpleEditor {

    activeSession: number;
    renderer: MapRenderer;

    private tabGroup: HTMLDivElement;

    sessions: Session[];

    constructor(sessions: Session[]) {

        // @ts-ignore
        global.editor = this;

        this.sessions = sessions;

        this.tabGroup = <HTMLDivElement> document.getElementById('editor-tab-menu');

        for (let index = 0; index < sessions.length; index++) {
            let next = sessions[index];
            next.editor = this;
            this.tabGroup.appendChild(next.tab);
            const _i = index;
            next.tab.addEventListener('click', () => {
                this.setActiveSession(_i);
            });
        }

        this.renderer = new MapRenderer();

        let container
            = <HTMLDivElement> document.getElementsByClassName("viewport").item(0);

        this.renderer.init(container, 'viewport', true);

        // Screenshot button.
        new KeyListener("F12", () => {
            let renderer = this.renderer.app.renderer;
            let renderTexture = PIXI.RenderTexture.create({width: renderer.width, height: renderer.height});
            renderer.render(this.renderer.app.stage, renderTexture);
            let canvas = renderer.extract.canvas(renderTexture);
            let b64 = canvas.toDataURL('image/png');
            let link = document.createElement("a");
            link.setAttribute("href", b64);
            link.setAttribute("download", "screenshot.png");
            link.click();
        });

        this.setActiveSession(this.sessions.length - 1);
    }

    setActiveSession(index: number) {

        this.activeSession = index;

        for (let _index = 0; _index < this.tabGroup.children.length; _index++) {
            let next = this.tabGroup.children.item(_index);
            next.classList.remove('selected');
        }

        if (index > -1) {
            this.sessions[index].tab.classList.add('selected');
        }

        if (index == -1) {
            this.renderer.setSession(null);
        } else {

            let session = this.sessions[this.activeSession];
            if (!session.loaded) {
                session.load();
            }

            this.renderer.setSession(session);
        }
    }
}
