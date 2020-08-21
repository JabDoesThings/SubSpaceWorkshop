import UIPanelTab from './UIPanelTab';
import UITabMenu from './UITabMenu';
import UITab from './UITab';
import { CustomEventListener } from '../CustomEventListener';
import { UIPanelEvent, UITabEvent } from '../UIEvents';
import { PanelOrientation, TabAction, TabOrientation, TabPanelAction } from '../UIProperties';
import { removeAllChildren } from '../UI';

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
   * @param {string} id
   * @param {string} tabMenuId
   * @param {PanelOrientation} orientation
   * @param {TabOrientation} tabOrientation
   * @param {number} width
   * @param {boolean} half
   * @param {string} halfPosition
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
   * @param {UIPanelTab} tabPanel The tab to select.
   *
   * @return {boolean} Returns true if the action is cancelled.
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

    const handleDeselect = () => {
      if (this.selectedTab === -1) {
        return;
      }
      const activeTab = this.panels[this.selectedTab];
      if (activeTab.element.classList.contains('open')) {
        activeTab.element.classList.remove('open');
      }
    };

    if (tabPanel == null) {
      handleDeselect();
      this.selectedTab = -1;
    } else {
      if (!this.contains(tabPanel)) {
        throw new Error('The tabPanel to select is not registered to the UIPanel.');
      }

      handleDeselect();

      this.selectedTab = this.getIndex(tabPanel);
      if (!tabPanel.element.classList.contains('open')) {
        tabPanel.element.classList.add('open');
      }
      const offset = tabPanel.getIndex() * -this.width;
      this.slidePane.style.left = offset + 'px';
      if (!this.element.classList.contains('open')) {
        this.element.classList.add('open');
      }
      this.tabMenu.select(tabPanel.tab);
    }

    this.element.style.width = this.width + 'px';
    return false;
  }

  /** @return {boolean} Returns true if the action is cancelled. */
  deselect(): boolean {
    if (this.selectedTab === -1) {
      return false;
    }

    const tabPanel = this.panels[this.selectedTab];
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
    const tab = new UITab(id, title);
    const tabPanel = new UIPanelTab(id);
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
      eventType: 'UIPanelEvent',
      tabPanel: panelTab,
      action: TabPanelAction.ADD,
      forced: false
    })) {
      return true;
    }

    const tab = new UITab(panelTab.id, title);
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
      throw new Error('The panelTab to remove is not registered to the UIPanel.');
    }

    // Package the event. If the event is cancelled, cancel the action.
    if (this.dispatch({
      eventType: 'UIPanelEvent',
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

    const newArray: UIPanelTab[] = [];
    for (let index = 0; index < this.panels.length; index++) {
      const next = this.panels[index];
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
        eventType: 'UIPanelEvent',
        tabPanel: null,
        action: TabPanelAction.SORT,
        forced: true
      });
    } else {
      this.dispatch({
        eventType: 'UIPanelEvent',
        tabPanel: null,
        action: TabPanelAction.SORT,
        forced: false
      });
    }

    removeAllChildren(this.slidePane);

    this.slidePane.style.width = `${this.width * 2}px`;
    if (this.panels.length === 0) {
      return false;
    }
    if (comparator != null) {
      this.panels.sort(comparator);
    }
    for (let index = 0; index < this.panels.length; index++) {
      let next = this.panels[index].element;
      next.style.left = `${this.width * index}px`;
      this.slidePane.appendChild(next);
    }
    return false;
  }

  getIndex(tabPanel: UIPanelTab): number {
    if (tabPanel == null) {
      throw new Error('The tabPanel given is null or undefined.');
    }
    if (!this.contains(tabPanel)) {
      throw new Error('The tabPanel given is not registered to the panel.');
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
      throw new Error('The tabPanel given is null or undefined.');
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
    const activeTabPanel = this.getOpenTab();
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
    this.element.style.width = `${this.width}px`;
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

export default UIPanel;
