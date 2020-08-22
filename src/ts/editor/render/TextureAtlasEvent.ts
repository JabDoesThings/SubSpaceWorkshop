import TextureAtlas from './TextureAtlas';
import MapSprite from './MapSprite';
import { CustomEvent } from '../../ui/UI';
import TextureAtlasAction from './ProjectAtlasAction';

export default interface TextureAtlasEvent extends CustomEvent {
  textureAtlas: TextureAtlas;
  action: TextureAtlasAction;
  sprites: { [id: string]: MapSprite };
}
