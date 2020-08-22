import MapSprite from './MapSprite';

/**
 * The <i>MapSpriteCollection</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class MapSpriteCollection {
  private sprites: MapSprite[] = [];

  /** Updates all MapSprites in the collection. */
  update(): void {
    // Go through all registered MapSprites in the collection sequentially and update them.
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].update();
    }
  }

  /** Resets all MapSprites in the collection. */
  reset(): void {
    // Go through all registered MapSprites in the collection sequentially and update them.
    for (let index = 0; index < this.sprites.length; index++) {
      this.sprites[index].reset();
    }
  }

  /**
   * Adds a MapSprite to the collection.
   *
   * @param {MapSprite} sprite The MapSprite to add.
   *
   * @return {number} Returns the index of the MapSprite.
   *
   * @throws {Error} Thrown if the MapSprite given is null or already registered to the collection.
   */
  addSprite(sprite: MapSprite): number {
    // Check to make sure the MapSprite is valid and not registered.
    if (sprite == null) {
      throw new Error('The MapSprite given is null.');
    } else if (this.getIndex(sprite) != -1) {
      throw new Error('The MapSprite given is already registered in the collection.');
    }
    // Properly push the MapSprite to the end of the array.
    this.sprites.push(sprite);
    // Returns the index of the registered MapSprite.
    return this.sprites.length - 1;
  }

  /**
   * Removes a MapSprite from the collection.
   *
   * @param {MapSprite} sprite The MapSprite to remove.
   *
   * @throws {Error} Thrown if the MapSprite given is null or is not registered to the collection.
   */
  removeSprite(sprite: MapSprite): void {
    // Check to make sure the MapSprite is valid and is registered.
    if (sprite == null) {
      throw new Error('The MapSprite given is null.');
    } else if (this.getIndex(sprite) == -1) {
      throw new Error('The MapSprite given is not registered in the collection.');
    }

    // Create the new array to replace the old one without the object.
    const newArray: MapSprite[] = [];
    // Go through all registered MapSprites.
    for (let index = 0; index < this.sprites.length; index++) {
      const next = this.sprites[index];
      // If the MapSprite explicitly matches the one to remove, we skip this and not add
      //   it to the new array.
      if (next === sprite) {
        continue;
      }
      // Push the next MapSprite to the end of the new array. All MapObjects prior to
      //   the one to remove will keep the same index. The ones following the MapSprite
      //   to remove will have different indexes.
      newArray.push(next);
    }
    // Set the new array with the removed MapSprite.
    this.sprites = newArray;
  }

  /**
   * @param {number} index The index of the MapSprite.
   *
   * @return {MapSprite} Returns the MapSprite stored at the index given.
   *
   * @throws {Error} Thrown if the index is negative or greater than the last index of the collection. (size() - 1)
   */
  getSprite(index: number): MapSprite {
    // Make sure that the index is in range.
    if (index < 0) {
      throw new Error(`The index given is negative. (${index})`);
    } else if (index > this.size() - 1) {
      throw new Error(
        `The index given is larger than the last index in the collection. (${index} given. Last index: ${this.size() - 1})`
      );
    }
    return this.sprites[index];
  }

  /**
   * @param {string} id
   *
   * @return {MapSprite}
   */
  getSpriteById(id: string): MapSprite {
    if (this.sprites.length === 0) {
      return null;
    }
    for (let index = 0; index < this.sprites.length; index++) {
      const next = this.sprites[index];
      if (next.id === id) {
        return next;
      }
    }
    return null;
  }

  /**
   * Tests whether or not the MapSprite is registered in the collection.
   *
   * @param {MapSprite} sprite The sprite to test.
   *
   * @return {number} Returns the index of the MapSprite in the storage array for the collection. <br>
   *     If the MapSprite is not stored in the collection, -1 is returned.
   */
  getIndex(sprite: MapSprite): number {
    // Go through all registered MapSprites with their respective indexes.
    for (let index = 0; index < this.sprites.length; index++) {
      const next = this.sprites[index];
      // If the next MapSprite explicitly matches the sprite, then this is
      //   the index we need to return.
      if (next != null && next === sprite) {
        return index;
      }
    }
    // Return -1 if the MapSprite is not added to the collection.
    return -1;
  }

  /** Clears all registered MapSprites in the collection. */
  clear(): void {
    this.sprites = [];
  }

  /** @return {number} Returns the amount of MapSprites registered in the collection. */
  size(): number {
    return this.sprites.length;
  }
}
