import CustomEventListener from '../../../../CustomEventListener';
import { SectionElementEvent } from './SectionElementEvent';

export default abstract class SectionElement extends CustomEventListener<SectionElementEvent> {
  readonly id: string;
  element: HTMLElement;

  protected constructor(id: string) {
    super();
    this.id = id;
  }

}

