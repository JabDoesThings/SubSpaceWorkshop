import { CustomEvent } from '../../ui/UI';
import TextureAtlas from './TextureAtlas';
import ProjectAtlas from './ProjectAtlas';
import AtlasAction from './AtlasAction';

export default interface ProjectAtlasEvent extends CustomEvent {
  projectAtlas: ProjectAtlas;
  action: AtlasAction;
  textures: { [id: string]: TextureAtlas };
}
