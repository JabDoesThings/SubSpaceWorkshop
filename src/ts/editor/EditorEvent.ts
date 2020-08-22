import { CustomEvent } from '../ui/UI';
import Editor from './Editor';
import EditorAction from './EditorAction';

/**
 * The <i>EditorEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
interface EditorEvent extends CustomEvent {
  editor: Editor;
  action: EditorAction;
}

export default EditorEvent;
