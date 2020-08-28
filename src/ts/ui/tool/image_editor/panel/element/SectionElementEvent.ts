import CustomEvent from '../../../../CustomEvent';
import SectionElement from './SectionElement';

/**
 * The <i>SectionElementEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface SectionElementEvent extends CustomEvent {
  forced: boolean;
  element: SectionElement;
  data: any;
}
