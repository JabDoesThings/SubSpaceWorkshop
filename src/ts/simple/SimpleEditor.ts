import { MapRenderer } from './render/MapRenderer';
import { KeyListener } from '../util/KeyListener';
import { Session } from './Session';

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

        $(document).on('click', '.section > .header > .arrow', function () {
            let section = this.parentElement.parentElement;
            let classList = section.classList;
            if (classList.contains('open')) {
                classList.remove('open');
            } else {
                classList.add('open');
            }
            let contentFrame = $(section).find('.content-frame').get(0);
            if (contentFrame.style.maxHeight) {
                contentFrame.style.maxHeight = null;
            } else {
                contentFrame.style.maxHeight = (contentFrame.scrollHeight) + "px";
            }
        });

        $(document).on('click', '.section > .header > .title', function () {
            let section = this.parentElement.parentElement;
            let classList = section.classList;
            if (classList.contains('open')) {
                classList.remove('open');
            } else {
                classList.add('open');
            }
            let contentFrame = $(section).find('.content-frame').get(0);
            if (contentFrame.style.maxHeight) {
                contentFrame.style.maxHeight = null;
            } else {
                contentFrame.style.maxHeight = (contentFrame.scrollHeight) + "px";
            }
        });

        let rightPanelOpen = true;
        let assetsTabOpen = true;
        let objectsTabOpen = false;

        let assetsPanelTab = document.getElementById('assets-panel-tab');
        let objectsPanelTab = document.getElementById('objects-panel-tab');

        let viewportFrame = document.getElementById('viewport-frame');
        let rightPanel = document.getElementById('right-panel');
        let assetsTab = document.getElementById('assets-tab');
        let objectsTab = document.getElementById('objects-tab');

        let sidePanelContents = $(rightPanel).find('.side-panel-contents').get(0);

        let panelWidth = 320;

        let openRightPanel = () => {

            rightPanelOpen = true;

            if (!viewportFrame.classList.contains('right-panel-open')) {
                viewportFrame.classList.add('right-panel-open');
            }
        };

        let closeRightPanel = () => {

            rightPanelOpen = false;

            if (viewportFrame.classList.contains('right-panel-open')) {
                viewportFrame.classList.remove('right-panel-open');
            }
        };

        let openAssetsTab = () => {

            assetsTabOpen = true;

            if (!assetsTab.classList.contains('selected')) {
                assetsTab.classList.add('selected');
            }

            sidePanelContents.style.left = '0px';

            if(objectsTabOpen) {
                closeObjectsTab();
            }

            if (!rightPanelOpen) {
                openRightPanel();
            }
        };

        let closeAssetsTab = () => {

            assetsTabOpen = false;

            if (assetsTab.classList.contains('selected')) {
                assetsTab.classList.remove('selected');
            }

            if (rightPanelOpen && !assetsTabOpen && !objectsTabOpen) {
                closeRightPanel();
            }
        };

        let openObjectsTab = () => {

            objectsTabOpen = true;

            if (!objectsTab.classList.contains('selected')) {
                objectsTab.classList.add('selected');
            }

            sidePanelContents.style.left = '-' + panelWidth + 'px';

            if(assetsTabOpen) {
                closeAssetsTab();
            }

            if (!rightPanelOpen) {
                openRightPanel();
            }
        };

        let closeObjectsTab = () => {

            objectsTabOpen = false;

            if (objectsTab.classList.contains('selected')) {
                objectsTab.classList.remove('selected');
            }

            if (rightPanelOpen && !assetsTabOpen && !objectsTabOpen) {
                closeRightPanel();
            }
        };

        $(assetsTab).on('click', () => {

            if (assetsTabOpen) {
                closeAssetsTab();
            } else {
                openAssetsTab();
            }
        });

        $(objectsTab).on('click', () => {

            if (objectsTabOpen) {
                closeObjectsTab();
            } else {
                openObjectsTab();
            }
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
