import CustomEvent from '../../../../CustomEvent';
import SectionElement from './SectionElement';

export interface SectionElementEvent extends CustomEvent {
  forced: boolean;
  element: SectionElement;
  data: any;
}
