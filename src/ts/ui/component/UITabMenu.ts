import UITab from './UITab';
import { UITabEvent } from '../UIEvents';
import { TabAction, TabOrientation } from '../UIProperties';

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

  /**
   * @param {string} id
   * @param {TabOrientation} orientation
   */
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
   * @param {UITabEvent} event The event to pass.
   * @param {boolean} ignoreCancelled If true, the event will not check for cancellation.
   *
   * @return {boolean} Returns true if the event is cancelled.
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
   * @param {UITab} tab
   * @param {boolean} select
   *
   * @return {boolean} Returns true if the action is cancelled.
   */
  addTab(tab: UITab, select: boolean = true): boolean {
    if (tab == null) {
      throw new Error('The UITab given is null or undefined.');
    }
    // Package the event. If the event is cancelled, cancel the action.
    if (this.dispatch({
      eventType: 'UITabEvent',
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
   * @param {UITab} tab
   *
   * @return {boolean} Returns true if the action is cancelled.
   */
  removeTab(tab: UITab): boolean {
    if (!this.contains(tab)) {
      throw new Error("The tab to remove is not registered to the UITabMenu.");
    }
    // Package the event. If the event is cancelled, cancel the action.
    if (this.dispatch({
      eventType: 'UITabEvent',
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

    const newArray: UITab[] = [];
    for (let index = 0; index < this.tabs.length; index++) {
      const next = this.tabs[index];
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
      eventType: 'UITabEvent',
      tab: null,
      action: TabAction.CLEAR,
      forced: false
    })) {
      return true;
    }
    for (let index = 0; index < this.tabs.length; index++) {
      const next = this.tabs[index];
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
        eventType: 'UITabEvent',
        tab: null,
        action: TabAction.SORT,
        forced: true
      });
    } else {
      this.dispatch({
        eventType: 'UITabEvent',
        tab: null,
        action: TabAction.SORT,
        forced: false
      });
    }

    const removeAllChildren = (element: HTMLElement) => {
      const count = element.childElementCount;
      if (count === 0) {
        return;
      }
      const children: Element[] = [];
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

    const handleDeselect = () => {
      if (this.selectedTab === -1) {
        return;
      }
      const activeTab = this.tabs[this.selectedTab];
      if (activeTab.element.classList.contains('selected')) {
        activeTab.element.classList.remove('selected');
      }
    };

    if (tab == null) {
      handleDeselect();
      this.selectedTab = -1;
    } else {
      if (!this.contains(tab)) {
        throw new Error('The tab to select is not registered to the UITabMenu.');
      }
      handleDeselect();
      this.selectedTab = this.getIndex(tab);
      if (!tab.element.classList.contains('selected')) {
        tab.element.classList.add('selected');
      }
    }

    return false;
  }

  /** @return {boolean} Returns true if the action is cancelled. */
  deselect(): boolean {
    if (this.selectedTab === -1) {
      return false;
    }

    const tab = this.tabs[this.selectedTab];
    if (this.dispatch({
      eventType: 'UITabEvent',
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
      const next = this.tabs[index];
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
      throw new Error('The tab given is null or undefined.');
    }
    if (!this.contains(tab)) {
      throw new Error('The tab given is not registered in the UITabMenu.');
    }
    for (let index = 0; index < this.tabs.length; index++) {
      const next = this.tabs[index];
      if (next === tab) {
        return index;
      }
    }
    return -1;
  }

  createTab(id: string, title: string, select: boolean = true): UITab {
    const tab = new UITab(id, title);
    this.addTab(tab, select);
    return tab;
  }
}

export default UITabMenu;
