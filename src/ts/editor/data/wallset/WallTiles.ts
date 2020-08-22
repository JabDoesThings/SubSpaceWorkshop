import Dirtable from '../../../util/Dirtable';
import Project from '../../Project';
import WallTile from './WallTile';

export default class WallTiles implements Dirtable {
  private readonly project: Project;
  private profiles: { [id: string]: WallTile };
  private dirty: boolean = true;

  /**
   * @param {Project} project
   */
  constructor(project: Project) {
    this.project = project;
  }

  preUpdate(): void {
    for (let id in this.profiles) {
      this.profiles[id].preUpdate();
    }
  }

  update(): void {
    for (let id in this.profiles) {
      this.profiles[id].update();
    }
  }

  postUpdate(): void {
    for (let id in this.profiles) {
      this.profiles[id].postUpdate();
    }
    this.setDirty(false);
  }

  add(wallTile: WallTile): void {
    this.profiles[wallTile.getId()] = wallTile;
  }

  remove(wallTile: WallTile | string): void {
    if (typeof wallTile === 'string') {
      this.profiles[wallTile] = undefined;
    } else {
      this.profiles[wallTile.getId()] = undefined;
    }
  }

  clear(): void {
    this.profiles = {};
  }

  getProfiles(): { [id: string]: WallTile } {
    return this.profiles;
  }

  /** @override */
  isDirty(): boolean {
    if (this.dirty) {
      return true;
    }
    for (let id in this.profiles) {
      if (this.profiles[id].isDirty()) {
        return true;
      }
    }
    return false;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }
}
