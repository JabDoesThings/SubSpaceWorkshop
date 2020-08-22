import EditorEvent from './EditorEvent';
import Project from './Project';

/**
 * The <i>EditorProjectEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
interface EditorProjectEvent extends EditorEvent {
  projects: Project[];
}

export default EditorProjectEvent;
