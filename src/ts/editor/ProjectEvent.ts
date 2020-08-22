import { CustomEvent } from '../ui/UI';
import Project from './Project';

/**
 * The <i>ProjectEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface ProjectEvent extends CustomEvent {
  project: Project;
}
