import Layer from './Layer';

export default abstract class GeneratedLayer extends Layer {
  private seed: number;
  private _generate: boolean = true;

  // protected constructor(type: string, id: string, name: string) {
  //   super(type, id, name);
  // }

  /** @override */
  protected onUpdate(delta: number): void {
    if (this.queueGenerate || this.isDirty()) {
      this.generate();
    }
  }

  generate(): void {
    try {
      this.onGenerate();
    } catch (e) {
      console.error(`Failed to generate layer. (ID: ${this.getId()}, name: ${this.getName()})`);
      console.error(e);
    }
    this._generate = false;
    this.setCacheDirty(true);
  }

  getSeed(): number {
    return this.seed;
  }

  /**
   * @param {number} seed
   */
  setSeed(seed: number): void {
    if (this.seed === seed) {
      return;
    }
    this.seed = seed;
    this.setDirty(true);
  }

  queueGenerate(): void {
    this._generate = true;
  }

  protected abstract onGenerate(): void;
}
