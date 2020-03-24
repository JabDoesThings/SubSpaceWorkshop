import { CustomEventListener, CustomEvent } from './CustomEventListener';

let removeAllChildren = (element: HTMLElement) => {

    let count = element.childElementCount;
    if (count === 0) {
        return;
    }

    let children: Element[] = [];
    for (let index = 0; index < element.childElementCount; index++) {
        children.push(element.children.item(index));
    }

    for (let index = 0; index < children.length; index++) {
        element.removeChild(children[index]);
    }
};

/**
 * The <i>UIPanel</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIPanel extends CustomEventListener<UIPanelEvent> {

    readonly element: HTMLDivElement;
    readonly overflowContainer: HTMLDivElement;
    readonly slidePane: HTMLDivElement;

    orientation: PanelOrientation;
    panels: UIPanelTab[];
    selectedTab: number;
    width: number;

    private tabMenu: UITabMenu;

    /**
     * Main constructor.
     *
     * @param id
     * @param tabMenuId
     * @param orientation
     * @param tabOrientation
     * @param width
     */
    constructor(id: string, tabMenuId: string, orientation: PanelOrientation = PanelOrientation.LEFT, tabOrientation: TabOrientation = TabOrientation.LEFT, width: number = 320, half: boolean = false, halfPosition: string = null) {

        super();

        this.orientation = orientation;
        this.width = width;

        this.panels = [];
        this.selectedTab = -1;

        this.tabMenu = new UITabMenu(tabMenuId, tabOrientation);

        this.slidePane = document.createElement('div');
        this.slidePane.classList.add('ui-panel-contents');

        this.overflowContainer = document.createElement('div');
        this.overflowContainer.classList.add('ui-panel-overflow-container');
        this.overflowContainer.appendChild(this.slidePane);

        this.element = document.createElement('div');
        if (id != null) {
            this.element.id = id;
        }

        this.element.classList.add('ui-panel', orientation);
        if (half) {
            this.element.classList.add('half');
        }
        if (halfPosition != null) {
            this.element.classList.add(halfPosition);
        }
        this.element.appendChild(this.overflowContainer);
        this.element.appendChild(this.tabMenu.element);
        this.element.style.width = '0';
    }

    /**
     * @param tabPanel The tab to select.
     *
     * @return Returns true if the action is cancelled.
     */
    select(tabPanel: UIPanelTab): boolean {

        // If the event is cancelled, don't apply the event.
        if (this.dispatch({
            eventType: "UIPanelEvent",
            tabPanel: tabPanel,
            action: TabPanelAction.SELECT,
            forced: false
        })) {
            return true;
        }

        let handleDeselect = () => {

            if (this.selectedTab === -1) {
                return;
            }

            let activeTab = this.panels[this.selectedTab];
            if (activeTab.element.classList.contains('open')) {
                activeTab.element.classList.remove('open');
            }
        };

        if (tabPanel == null) {
            handleDeselect();
            this.selectedTab = -1;
        } else {

            if (!this.contains(tabPanel)) {
                throw new Error("The tabPanel to select is not registered to the UIPanel.");
            }

            handleDeselect();

            this.selectedTab = this.getIndex(tabPanel);
            if (!tabPanel.element.classList.contains('open')) {
                tabPanel.element.classList.add('open');
            }

            let offset = tabPanel.getIndex() * -this.width;
            this.slidePane.style.left = offset + 'px';

            if (!this.element.classList.contains('open')) {
                this.element.classList.add('open');
            }

            this.tabMenu.select(tabPanel.tab);
        }

        this.element.style.width = this.width + 'px';

        return false;
    }

    /**
     * @return Returns true if the action is cancelled.
     */
    deselect(): boolean {

        if (this.selectedTab === -1) {
            return false;
        }

        let tabPanel = this.panels[this.selectedTab];

        if (this.dispatch({
            eventType: "UIPanelEvent",
            tabPanel: tabPanel,
            action: TabPanelAction.DESELECT,
            forced: false
        })) {
            return true;
        }

        if (tabPanel.element.classList.contains('open')) {
            tabPanel.element.classList.remove('open');
        }

        this.tabMenu.deselect();

        this.selectedTab = -1;

        if (this.element.classList.contains('open')) {
            this.element.classList.remove('open');
        }

        this.element.style.width = '0';

        return false;
    }

    createPanel(id: string, title: string, open: boolean = false): UIPanelTab {

        let tab = new UITab(id, title);
        let tabPanel = new UIPanelTab(id);
        tabPanel.tab = tab;
        tabPanel.panel = this;

        tab.addEventListener((event: UITabEvent) => {
            if (event.action == TabAction.SELECT) {
                this.select(tabPanel);
            } else if (event.action == TabAction.DESELECT) {
                this.deselect();
            }
        });

        this.panels.push(tabPanel);
        this.tabMenu.addTab(tab, open);

        this.sort();

        if (open) {
            this.select(tabPanel);
        }

        return tabPanel;
    }

    add(panelTab: UIPanelTab, title: string, open: boolean = false): boolean {

        // Package the event. If the event is cancelled, cancel the action.
        if (this.dispatch({
            eventType: "UIPanelEvent",
            tabPanel: panelTab,
            action: TabPanelAction.ADD,
            forced: false
        })) {
            return true;
        }

        let tab = new UITab(panelTab.id, title);
        tab.addEventListener((event: UITabEvent) => {
            if (event.action == TabAction.SELECT) {
                this.select(panelTab);
            } else if (event.action == TabAction.DESELECT) {
                this.deselect();
            }
        });

        panelTab.tab = tab;
        panelTab.panel = this;

        this.panels.push(panelTab);
        this.tabMenu.addTab(tab, open);

        this.sort(null, true);

        if (open) {
            this.select(panelTab);
        }

        return false;
    }

    remove(panelTab: UIPanelTab): boolean {

        if (!this.contains(panelTab)) {
            throw new Error("The panelTab to remove is not registered to the UIPanel.");
        }

        // Package the event. If the event is cancelled, cancel the action.
        if (this.dispatch({
            eventType: "UIPanelEvent",
            tabPanel: panelTab,
            action: TabPanelAction.REMOVE,
            forced: false
        })) {
            return true;
        }

        if (this.getIndex(panelTab) === this.selectedTab) {
            if (this.size() === 1) {
                this.selectedTab = -1;
            } else {
                this.selectedTab = 0;
            }
        }

        panelTab.panel = null;

        let newArray: UIPanelTab[] = [];
        for (let index = 0; index < this.panels.length; index++) {
            let next = this.panels[index];
            if (next === panelTab) {
                continue;
            }
            newArray.push(next);
        }

        this.panels = newArray;
        return false;
    }

    sort(comparator: (a: UIPanelTab, b: UIPanelTab) => number = null, force: boolean = false): boolean {

        if (force) {
            this.dispatch({
                eventType: "UIPanelEvent",
                tabPanel: null,
                action: TabPanelAction.SORT,
                forced: true
            });
        } else {
            this.dispatch({
                eventType: "UIPanelEvent",
                tabPanel: null,
                action: TabPanelAction.SORT,
                forced: false
            });
        }

        removeAllChildren(this.slidePane);

        this.slidePane.style.width = (this.width * 2) + 'px';

        if (this.panels.length === 0) {
            return false;
        }

        if (comparator != null) {
            this.panels.sort(comparator);
        }

        for (let index = 0; index < this.panels.length; index++) {
            let next = this.panels[index].element;
            next.style.left = (this.width * index) + 'px';
            this.slidePane.appendChild(next);
        }

        return false;
    }

    getIndex(tabPanel: UIPanelTab): number {

        if (tabPanel == null) {
            throw new Error("The tabPanel given is null or undefined.");
        }

        if (!this.contains(tabPanel)) {
            throw new Error("The tabPanel given is not registered to the panel.");
        }

        for (let index = 0; index < this.panels.length; index++) {
            if (this.panels[index] === tabPanel) {
                return index;
            }
        }

        return -1;
    }

    contains(tabPanel: UIPanelTab): boolean {

        if (tabPanel == null) {
            throw new Error("The tabPanel given is null or undefined.");
        }

        for (let index = 0; index < this.panels.length; index++) {
            if (this.panels[index] === tabPanel) {
                return true;
            }
        }

        return false;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    size(): number {
        return this.panels.length;
    }

    getOpenTab(): UIPanelTab {

        if (this.isEmpty()) {
            return null;
        }

        if (this.selectedTab > -1) {
            return this.panels[this.selectedTab];
        }

        return null;
    }

    getPanel(id: string): UIPanelTab {

        for (let index = 0; index < this.panels.length; index++) {
            let next = this.panels[index];
            if (next.id === id) {
                return next;
            }
        }

        return null;
    }

    isOpen(): boolean {
        return this.element.classList.contains('open');
    }

    open(): void {

        if (this.isOpen()) {
            return;
        }

        let activeTabPanel = this.getOpenTab();
        if (activeTabPanel != null) {
            if (!activeTabPanel.element.classList.contains('open')) {
                activeTabPanel.element.classList.add('open');
            }
        }

        if (this.selectedTab == -1 && this.panels.length !== 0) {
            let panel = this.panels[0];
            this.select(this.panels[0]);
            this.tabMenu.select(panel.tab);

        }

        if (!this.element.classList.contains('open')) {
            this.element.classList.add('open');
        }

        this.element.style.width = this.width + 'px';
    }

    close(): void {

        if (!this.isOpen()) {
            return;
        }

        if (this.element.classList.contains('open')) {
            this.element.classList.remove('open');
        }

        this.element.style.width = '0';
    }
}

/**
 * The <i>UIPanelTab</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIPanelTab {

    readonly element: HTMLDivElement;

    sections: UIPanelSection[];
    panel: UIPanel;
    tab: UITab;
    id: string;

    /**
     * Main constructor.
     *
     * @param id The ID of the panel-tab.
     */
    constructor(id: string) {
        this.id = id;
        this.sections = [];
        this.element = document.createElement('div');
        this.element.classList.add('ui-panel-tab');
    }

    getIndex(): number {
        return this.panel == null ? -1 : this.panel.getIndex(this);
    }

    createSection(id: string, title: string): UIPanelSection {
        let section = new UIPanelSection(id, title);
        this.add(section);
        return section;
    }

    add(section: UIPanelSection): void {
        section.panelTab = this;
        this.sections.push(section);
        this.sort(null);
    }

    sort(comparator: (a: UIPanelSection, b: UIPanelSection) => number): boolean {

        removeAllChildren(this.element);

        if (this.sections.length === 0) {
            return false;
        }

        if (comparator != null) {
            this.sections.sort(comparator);
        }

        for (let index = 0; index < this.sections.length; index++) {
            let next = this.sections[index].element;
            this.element.appendChild(next);
        }

        return false;
    }

    openAllSections(delay: number = 0): void {

        if (this.isEmpty()) {
            return;
        }

        if (delay < 0) {
            throw new Error("Closing delay values cannot be negative. (" + delay + " given)");
        }

        for (let index = 0; index < this.sections.length; index++) {
            if (!this.sections[index].isOpen()) {
                this.sections[index].open(delay);
            }
        }
    }

    closeAllSections(delay: number = 0): void {

        if (this.isEmpty()) {
            return;
        }

        if (delay < 0) {
            throw new Error("Closing delay values cannot be negative. (" + delay + " given)");
        }

        for (let index = 0; index < this.sections.length; index++) {
            if (this.sections[index].isOpen()) {
                this.sections[index].close(delay);
            }
        }
    }

    getSection(id: string): UIPanelSection {

        if (this.isEmpty()) {
            return null;
        }

        for (let index = 0; index < this.sections.length; index++) {
            let next = this.sections[index];
            if (next.id === id) {
                return next;
            }
        }

        return null;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    size(): number {
        return this.sections.length;
    }
}

/**
 * The <i>UIPanelSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIPanelSection {

    readonly header: UIPanelSectionHeader;
    readonly content: UIPanelSectionContent;
    readonly element: HTMLDivElement;
    readonly id: string;

    panelTab: UIPanelTab;

    private opening: NodeJS.Timeout;
    private closing: NodeJS.Timeout;

    constructor(id: string, title: string) {

        this.id = id;

        this.header = new UIPanelSectionHeader(this, title);
        this.content = new UIPanelSectionContent();

        this.element = document.createElement('div');
        this.element.classList.add('ui-panel-section');
        this.element.appendChild(this.header.element);
        this.element.appendChild(this.content.element);

        this.opening = null;
        this.closing = null;
    }

    open(delay: number = 0): void {

        let css = () => {
            if (!this.element.classList.contains('open')) {
                this.element.classList.add('open');
            }
            if (this.header.arrowLabel.innerHTML !== '▼') {
                this.header.arrowLabel.innerHTML = '▼';
            }

            this.content.element.style.maxHeight = (this.content.element.scrollHeight) + "px";
            this.opening = null;
        };

        if (delay !== 0) {

            if (delay < 0) {
                throw new Error("Opening delay values cannot be negative. (" + delay + " given)");
            }

            if (this.opening != null) {
                clearTimeout(this.opening);
            }

            this.opening = setTimeout(css, delay);
        } else {
            css();
        }
    }

    close(delay: number = 0): void {

        let css = () => {
            if (this.element.classList.contains('open')) {
                this.element.classList.remove('open');
            }

            if (this.content.element.style.maxHeight) {
                this.content.element.style.maxHeight = null;
            }

            if (this.header.arrowLabel.innerHTML !== '►') {
                this.header.arrowLabel.innerHTML = '►';
            }

            this.closing = null;
        };

        if (delay !== 0) {

            if (delay < 0) {
                throw new Error("Closing delay values cannot be negative. (" + delay + " given)");
            }

            if (this.closing != null) {
                clearTimeout(this.closing);
            }

            this.closing = setTimeout(css, delay);
        } else {
            css();
        }
    }

    setTitle(title: string): void {
        this.header.setTitle(title);
    }

    setContents(contents: HTMLElement[], open: boolean = false, openDelay: number = 0): void {
        this.content.setContents(contents);
        if (open) {
            this.open(openDelay);
        }
    }

    isOpen(): boolean {
        return this.element.classList.contains('open');
    }
}

/**
 * The <i>UIPanelSectionHeader</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIPanelSectionHeader {

    readonly element: HTMLDivElement;
    private readonly arrow: HTMLDivElement;
    readonly arrowLabel: HTMLLabelElement;
    private readonly title: HTMLDivElement;
    private readonly titleLabel: HTMLLabelElement;
    private readonly section: UIPanelSection;

    constructor(section: UIPanelSection, title: string = null) {

        this.section = section;

        this.arrow = document.createElement('div');
        this.arrow.classList.add('arrow');
        this.arrowLabel = document.createElement('label');
        this.arrowLabel.innerHTML = '►';
        this.arrow.appendChild(this.arrowLabel);

        this.titleLabel = document.createElement('label');
        this.setTitle(title);

        this.title = document.createElement('div');
        this.title.classList.add('title');
        this.title.appendChild(this.titleLabel);

        this.element = document.createElement('div');
        this.element.classList.add('header');
        this.element.appendChild(this.arrow);
        this.element.appendChild(this.title);

        this.arrow.addEventListener('click', () => {
            if (section.isOpen()) {
                section.close();
            } else {
                section.open();
            }
        });

        this.title.addEventListener('click', () => {
            if (section.isOpen()) {
                section.close();
            } else {
                section.open();
            }
        });
    }

    setTitle(title: string) {
        this.titleLabel.innerHTML = title == null ? '' : title;
    }
}

/**
 * The <i>UIPanelSectionContent</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIPanelSectionContent {

    readonly element: HTMLDivElement;
    readonly contents: HTMLDivElement;

    constructor() {

        this.contents = document.createElement('div');
        this.contents.classList.add('contents');

        this.element = document.createElement('div');
        this.element.classList.add('content-frame');
        this.element.appendChild(this.contents);
    }

    setContents(contents: HTMLElement[]): void {

        removeAllChildren(this.contents);

        if (contents.length === 0) {
            return;
        }

        for (let index = 0; index < contents.length; index++) {
            this.contents.appendChild(contents[index]);
        }
    }
}

/**
 * The <i>UITabMenu</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UITabMenu {

    tabs: UITab[];
    callbacks: ((event: UITabEvent) => void | boolean)[];
    orientation: TabOrientation;
    element: HTMLDivElement;
    selectedTab: number;

    constructor(id: string = null, orientation: TabOrientation = TabOrientation.TOP) {

        this.orientation = orientation;
        this.tabs = [];
        this.selectedTab = -1;
        this.callbacks = [];

        this.element = document.createElement('div');
        this.element.classList.add('ui-tab-menu', this.orientation);

        if (id != null) {
            this.element.id = id;
        }

        this.sort(null, true);
    }

    /**
     * Dispatches a event.
     *
     * @param event The event to pass.
     * @param ignoreCancelled If true, the event will not check for cancellation.
     *
     * @return Returns true if the event is cancelled.
     */
    private dispatch(event: UITabEvent, ignoreCancelled: boolean = false): boolean {

        for (let index = 0; index < this.callbacks.length; index++) {
            if (ignoreCancelled) {
                this.callbacks[index](event);
            } else if (this.callbacks[index](event)) {
                return true;
            }
        }

        return false;
    }

    addCallback(callback: (event: UITabEvent) => void | boolean): void {
        this.callbacks.push(callback);
    }

    clearCallbacks(): void {
        this.callbacks = [];
    }

    /**
     *
     * @param tab
     * @param select
     *
     * @return Returns true if the action is cancelled.
     */
    addTab(tab: UITab, select: boolean = true): boolean {

        if (tab == null) {
            throw new Error("The UITab given is null or undefined.");
        }

        // Package the event. If the event is cancelled, cancel the action.
        if (this.dispatch({
            eventType: "UITabEvent",
            tab: tab,
            action: TabAction.ADD,
            forced: false
        })) {
            return true;
        }

        tab.menu = this;
        this.tabs.push(tab);

        this.sort(null, true);

        if (select) {
            this.select(tab);
        }
    }

    /**
     *
     * @param tab
     *
     * @return Returns true if the action is cancelled.
     */
    removeTab(tab: UITab): boolean {

        if (!this.contains(tab)) {
            throw new Error("The tab to remove is not registered to the UITabMenu.");
        }

        // Package the event. If the event is cancelled, cancel the action.
        if (this.dispatch({
            eventType: "UITabEvent",
            tab: tab,
            action: TabAction.REMOVE,
            forced: false
        })) {
            return true;
        }

        if (this.getIndex(tab) === this.selectedTab) {
            if (this.size() === 1) {
                this.selectedTab = -1;
            } else {
                this.selectedTab = 0;
            }
        }

        tab.menu = null;

        let newArray: UITab[] = [];
        for (let index = 0; index < this.tabs.length; index++) {
            let next = this.tabs[index];
            if (next === tab) {
                continue;
            }
            newArray.push(next);
        }

        this.tabs = newArray;
        return false;
    }

    clear(): boolean {

        // Package the event. If the event is cancelled, cancel the action.
        if (this.dispatch({
            eventType: "UITabEvent",
            tab: null,
            action: TabAction.CLEAR,
            forced: false
        })) {
            return true;
        }

        for (let index = 0; index < this.tabs.length; index++) {
            let next = this.tabs[index];
            next.menu = null;
        }

        this.tabs = [];
        this.selectedTab = -1;

        return false;
    }

    getOrientation(): TabOrientation {

        if (this.element.classList.contains('top')) {
            return TabOrientation.TOP;
        } else if (this.element.classList.contains('bottom')) {
            return TabOrientation.BOTTOM;
        } else if (this.element.classList.contains('left')) {
            return TabOrientation.LEFT;
        } else if (this.element.classList.contains('right')) {
            return TabOrientation.RIGHT;
        }

        return TabOrientation.NONE;
    }

    getId(): string {
        return this.element.id;
    }

    private sort(comparator: (a: UITab, b: UITab) => number = null, force: boolean = false): boolean {

        if (force) {
            // Package the event. Ignore the event being cancelled.
            this.dispatch({
                eventType: "UITabEvent",
                tab: null,
                action: TabAction.SORT,
                forced: true
            });
        } else {
            this.dispatch({
                eventType: "UITabEvent",
                tab: null,
                action: TabAction.SORT,
                forced: false
            });
        }

        let removeAllChildren = (element: HTMLElement) => {

            let count = element.childElementCount;
            if (count === 0) {
                return;
            }

            let children: Element[] = [];
            for (let index = 0; index < element.childElementCount; index++) {
                children.push(element.children.item(index));
            }

            for (let index = 0; index < children.length; index++) {
                element.removeChild(children[index]);
            }
        };

        removeAllChildren(this.element);

        if (this.tabs.length === 0) {
            return false;
        }

        if (comparator != null) {
            this.tabs.sort(comparator);
        }

        for (let index = 0; index < this.tabs.length; index++) {
            this.element.appendChild(this.tabs[index].element);
        }

        return false;
    }

    /**
     * @param tab The tab to select.
     *
     * @return Returns true if the action is cancelled.
     */
    select(tab: UITab): boolean {

        // If the event is cancelled, don't apply the event.
        if (this.dispatch({
            eventType: "UITabEvent",
            tab: tab,
            action: TabAction.SELECT,
            forced: false
        })) {
            return true;
        }

        let handleDeselect = () => {

            if (this.selectedTab === -1) {
                return;
            }

            let activeTab = this.tabs[this.selectedTab];
            if (activeTab.element.classList.contains('selected')) {
                activeTab.element.classList.remove('selected');
            }
        };

        if (tab == null) {
            handleDeselect();
            this.selectedTab = -1;
        } else {

            if (!this.contains(tab)) {
                throw new Error("The tab to select is not registered to the UITabMenu.");
            }

            handleDeselect();

            this.selectedTab = this.getIndex(tab);
            if (!tab.element.classList.contains('selected')) {
                tab.element.classList.add('selected');
            }
        }

        return false;
    }

    /**
     * @return Returns true if the action is cancelled.
     */
    deselect(): boolean {

        if (this.selectedTab === -1) {
            return false;
        }

        let tab = this.tabs[this.selectedTab];

        if (this.dispatch({
            eventType: "UITabEvent",
            tab: tab,
            action: TabAction.DESELECT,
            forced: false
        })) {
            return true;
        }

        if (tab.element.classList.contains('selected')) {
            tab.element.classList.remove('selected');
        }

        this.selectedTab = -1;

        return false;
    }

    contains(tab: UITab) {

        if (this.isEmpty()) {
            return false;
        }

        for (let index = 0; index < this.tabs.length; index++) {
            let next = this.tabs[index];
            if (next === tab) {
                return true;
            }
        }

        return false;
    }

    getSelected(): UITab {

        if (this.selectedTab == -1) {
            return null;
        }

        return this.tabs[this.selectedTab];
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    size(): number {
        return this.tabs.length;
    }

    getIndex(tab: UITab): number {

        if (tab == null) {
            throw new Error("The tab given is null or undefined.");
        }

        if (!this.contains(tab)) {
            throw new Error("The tab given is not registered in the UITabMenu.");
        }

        for (let index = 0; index < this.tabs.length; index++) {
            let next = this.tabs[index];
            if (next === tab) {
                return index;
            }
        }

        return -1;
    }

    createTab(id: string, title: string, select: boolean = true): UITab {
        let tab = new UITab(id, title);
        this.addTab(tab, select);
        return tab;
    }
}

/**
 * The <i>UITab</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UITab extends CustomEventListener<UITabEvent> {

    element: HTMLDivElement;
    label: HTMLLabelElement;
    menu: UITabMenu;

    constructor(id: string = null, title: string) {

        super();

        this.menu = null;

        // Create the label element for the title.
        this.label = <HTMLLabelElement> document.createElement('label');
        this.setTitle(title);

        // Create the main element for the tab.
        this.element = document.createElement('div');

        if (id != null) {
            this.element.id = id;
        }

        this.element.classList.add('ui-tab');
        this.element.appendChild(this.label);

        this.element.addEventListener('click', () => {
            if (this.isSelected()) {
                if (!this.menu.deselect()) {
                    this.dispatch({
                        eventType: "UITabEvent",
                        tab: this,
                        action: TabAction.DESELECT,
                        forced: false
                    });
                }
            } else if (!this.menu.select(this)) {
                this.dispatch({
                    eventType: "UITabEvent",
                    tab: this,
                    action: TabAction.SELECT,
                    forced: false
                });
            }
        });
    }

    getTitle(): string {
        return this.label.innerHTML;
    }

    setTitle(title: string): void {

        if (title == null) {
            this.label.innerHTML = '';
        } else {
            this.label.innerHTML = title;
        }
    }

    getId(): string {
        return this.element.id;
    }

    isSelected(): boolean {
        return this.menu != null && this.menu.selectedTab == this.getIndex();
    }

    getIndex(): number {
        return this.menu != null && !this.menu.isEmpty() ? this.menu.getIndex(this) : -1;
    }

    select(): void {
        if (this.menu != null) {
            this.menu.select(this);
        }
    }
}

export class UIIconToolbar extends CustomEventListener<UIIconToolbarEvent> {

    readonly element: HTMLDivElement;

    readonly tools: UITool[];
    active: number;

    private toolListener: (event: UIToolEvent) => void;

    constructor(orientation: ToolbarOrientation = ToolbarOrientation.TOP) {

        super();

        this.tools = [];

        this.element = document.createElement('div');
        this.element.classList.add('ui-icon-toolbar');
        this.element.classList.add(orientation);

        this.active = -1;

        this.toolListener = (event: UIToolEvent): void => {
            let index = this.getIndex(event.tool);
            if (index == -1) {
                return;
            }

            this.setActiveIndex(index);
        };
    }

    getIndex(tool: UITool): number {

        for (let index = 0; index < this.tools.length; index++) {
            let next = this.tools[index];
            if (next === tool) {
                return index;
            }
        }

        return -1;
    }

    add(tool: UITool): void {

        tool.toolbar = this;

        let classList = tool.element.classList;
        if (classList.contains('selected')) {
            classList.remove('selected');
        }

        tool.addEventListener(this.toolListener);

        this.element.appendChild(tool.element);

        this.tools.push(tool);

        this.dispatch({
            eventType: 'UIIconToolbarEvent',
            toolBar: this,
            tool: tool,
            action: IconToolbarAction.ADD_TOOL,
            forced: true
        });
    }

    remove(tool: UITool): void {

        tool.toolbar = null;
        this.element.removeChild(tool.element);

        let classList = tool.element.classList;
        if (classList.contains('selected')) {
            classList.remove('selected');
        }

        tool.removeEventListener(this.toolListener);

        let temp = [];
        for (let index = 0; index < this.tools.length; index++) {
            let next = this.tools[index];
            if (next === tool) {
                continue;
            }
            temp.push(tool);
        }

        this.tools.length = 0;
        for (let index = 0; index < temp.length; index++) {
            this.tools.push(temp[index]);
        }

        this.dispatch({
            eventType: 'UIIconToolbarEvent',
            toolBar: this,
            tool: tool,
            action: IconToolbarAction.REMOVE_TOOL,
            forced: true
        });
    }

    setActive(tool: UITool): void {
        this.setActiveIndex(this.getIndex(tool));
    }

    setActiveIndex(index: number): void {

        let tool = this.tools[this.active];

        if (tool != null) {
            let classList = tool.element.classList;
            if (classList.contains('selected')) {
                classList.remove('selected');
            }
        }

        this.active = index;

        tool = this.tools[this.active];

        if (tool != null) {
            let classList = tool.element.classList;
            if (!classList.contains('selected')) {
                classList.add('selected');
            }
        }

        this.dispatch({
            eventType: 'UIIconToolbarEvent',
            toolBar: this,
            tool: tool,
            action: IconToolbarAction.SET_ACTIVE,
            forced: true
        });
    }

    get(index: number): UITool {
        return this.tools[index];
    }
}

export interface UIIconToolbarEvent {
    toolBar: UIIconToolbar,
    tool: UITool,
    action: IconToolbarAction
}

export enum IconToolbarAction {
    SET_ACTIVE = 'set-active',
    ADD_TOOL = 'add-tool',
    REMOVE_TOOL = 'remove-tool'
}

export class UITool extends CustomEventListener<UIToolEvent> {

    readonly element: HTMLDivElement;
    readonly id: string;
    private readonly icon: UIIcon;
    private readonly tooltip: UITooltip;

    toolbar: UIIconToolbar;

    constructor(id: string, icon: UIIcon, tooltip: UITooltip) {

        super();

        this.id = id;
        this.icon = icon;
        this.tooltip = tooltip;

        this.toolbar = null;

        this.element = document.createElement('div');
        this.element.classList.add('tool');
        this.element.appendChild(icon.element);
        this.element.appendChild(tooltip.element);
        this.element.addEventListener('click', (event) => {
            this.dispatch({
                eventType: 'UIToolEvent',
                tool: this,
                action: ToolAction.SELECT,
                forced: true
            });
        });
    }
}

export interface UIToolEvent extends CustomEvent {
    tool: UITool,
    action: ToolAction
}

export enum ToolAction {
    SELECT = 'select'
}

export class UIIcon {

    readonly element: HTMLElement;

    constructor(classes: string[]) {

        this.element = document.createElement('i');

        for (let index = 0; index < classes.length; index++) {
            this.element.classList.add(classes[index]);
        }
    }
}

export class UITooltip {

    readonly element: HTMLDivElement;
    readonly labelElement: HTMLLabelElement;

    constructor(text: string) {

        this.labelElement = document.createElement('label');
        this.labelElement.innerText = text;

        this.element = document.createElement('div');
        this.element.classList.add('ui-tooltip');
        this.element.appendChild(this.labelElement);
    }
}

export interface UIIconToolbarEvent extends CustomEvent {

}

export enum ToolbarOrientation {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right'
}

/**
 * The <i>TabAction</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum TabAction {
    SORT = 'sort',
    CLEAR = 'clear',
    SELECT = 'select',
    DESELECT = 'deselect',
    ADD = 'add',
    REMOVE = 'remove',
}

/**
 * The <i>TabOrientation</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum TabOrientation {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
    NONE = 'none'
}

/**
 * The <i>TabPanelAction</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum TabPanelAction {
    SORT = 'sort',
    ADD = 'add',
    REMOVE = 'remove',
    CREATE = 'create',
    SELECT = 'select',
    DESELECT = 'deselect',
    CLEAR = 'clear'
}

/**
 * The <i>PanelOrientation</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum PanelOrientation {
    LEFT = 'left',
    RIGHT = 'right'
}

/**
 * The <i>UITabEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface UITabEvent extends CustomEvent {
    tab: UITab,
    action: TabAction,
}

/**
 * The <i>UIPanelEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface UIPanelEvent extends CustomEvent {
    tabPanel: UIPanelTab,
    action: TabPanelAction,
}
