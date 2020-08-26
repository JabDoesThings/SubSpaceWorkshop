// Contents
import UIIcon from './component/UIIcon';
import UIIconToolbar from './component/UIIconToolbar';
import UIInnerWindow from './component/frame/UIInnerWindow';
import UILayer from './component/UILayer';
import UIPanel from './component/UIPanel';
import UIPanelSection from './component/UIPanelSection';
import UIPanelSectionContent from './component/UIPanelSectionContent';
import UIPanelSectionHeader from './component/UIPanelSectionHeader';
import UIPanelTab from './component/UIPanelTab';
import UITab from './component/UITab';
import UITabMenu from './component/UITabMenu';
import UITool from './component/UITool';
import UITooltip from './component/UITooltip';
import CustomEventListener from './CustomEventListener';
import CustomEvent from './CustomEvent';
import ItemSelectorListener from './ItemSelectorListener';
import { ItemSelectorEvent, UIIconToolbarEvent, UITabEvent, UIToolEvent, UIPanelEvent } from './UIEvents';
import {
  ItemSelectorAction,
  IconToolbarAction,
  ToolAction,
  ToolbarOrientation,
  ToolbarSize,
  TabAction,
  TabOrientation,
  TabPanelAction,
  PanelOrientation,
} from './UIProperties';
import { removeAllChildren } from './UIUtils';
import UIMenuBar from './component/UIMenuBar';
import UIMenuBarItem from './component/UIMenuBarItem';
import UIMenuBarItemAction from './component/UIMenuBarItemAction';

// const $document = $(document);
//
// const prevent = (id: string, events: string[]): void => {
//   events.forEach(e => {
//     $document.on(e, id, (event: any) => {
//       event.stopPropagation();
//     });
//   });
// };

export {
  UIMenuBar,
  UIMenuBarItem,
  UIMenuBarItemAction
};

export {
  // Components
  UIIcon,
  UIIconToolbar,
  UIInnerWindow,
  UILayer,
  UIPanel,
  UIPanelSection,
  UIPanelSectionContent,
  UIPanelSectionHeader,
  UIPanelTab,
  UITab,
  UITabMenu,
  UITool,
  UITooltip,
  // Events
  CustomEventListener,
  CustomEvent,
  ItemSelectorListener,
  ItemSelectorEvent,
  UIIconToolbarEvent,
  UITabEvent,
  UIToolEvent,
  UIPanelEvent,
  // Properties
  ItemSelectorAction,
  IconToolbarAction,
  ToolAction,
  ToolbarOrientation,
  ToolbarSize,
  TabAction,
  TabOrientation,
  TabPanelAction,
  PanelOrientation,
  // Utils
  removeAllChildren
};
