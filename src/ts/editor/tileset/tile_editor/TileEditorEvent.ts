import TileEditorEventType from './TileEditorEventType';

/**
 * The <i>TileEditorEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface TileEditorEvent {
  type: TileEditorEventType;
  data: { x: number, y: number, pressure: number };
  button: number;
  e: any;
}
