import MapSprite from '../MapSprite';
import { CompiledLVZScreenObject } from '../../../io/LVZ';

/**
 * The <i>LVZScreenEntry</i> interface. TODO: Document.
 *
 * @author Jab
 */
export default interface LVZScreenEntry {
  sprite: MapSprite;
  _sprite: PIXI.Sprite;
  object: CompiledLVZScreenObject;
}
