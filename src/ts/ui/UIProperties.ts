/**
 * The <i>ItemSelectorAction</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum ItemSelectorAction {
  HOVER_ITEM = 'hover-item',
  HOVER_ENTER = 'hover-enter',
  HOVER_EXIT = 'hover-exit',
  SELECT_ITEM = 'select-item',
  PRE_DRAW = 'pre-draw',
  POST_DRAW = 'post-draw'
}

export enum IconToolbarAction {
  SET_ACTIVE = 'set-active',
  ADD_TOOL = 'add-tool',
  REMOVE_TOOL = 'remove-tool'
}

export enum ToolAction {
  SELECT = 'select'
}

export enum ToolbarOrientation {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
}

export enum ToolbarSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
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
  OPEN = 'open',
  CLOSE = 'close',
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
