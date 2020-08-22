import { CustomEvent } from '../ui/UI';

export default interface MenuEvent extends CustomEvent {
  menuId: string;
}
