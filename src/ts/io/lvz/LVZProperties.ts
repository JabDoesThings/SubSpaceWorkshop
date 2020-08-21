/**
 * The <i>LVZDisplayMode</i> class. TODO: Document.
 *
 * <ul>
 *      <li> 0 = ShowAlways
 *      <li> 1 = EnterZone
 *      <li> 2 = EnterArena
 *      <li> 3 = Kill
 *      <li> 4 = Death
 *      <li> 5 = ServerControlled
 * </ul>
 *
 * @author Jab
 */
export enum LVZDisplayMode {
  ShowAlways = 0,
  EnterZone = 1,
  EnterArena = 2,
  Kill = 3,
  Death = 4,
  ServerControlled = 5
}

/**
 * The <i>LVZRenderLayer</i> enum. TODO: Document.
 *
 * <ul>
 *      <li> 0 = BelowAll
 *      <li> 1 = AfterBackground
 *      <li> 2 = AfterTiles
 *      <li> 3 = AfterWeapons
 *      <li> 4 = AfterShips
 *      <li> 5 = AfterGauges
 *      <li> 6 = AfterChat
 *      <li> 7 = TopMost
 * </ul>
 *
 * @author Jab
 */
export enum LVZRenderLayer {
  BelowAll = 0,
  AfterBackground = 1,
  AfterTiles = 2,
  AfterWeapons = 3,
  AfterShips = 4,
  AfterGauges = 5,
  AfterChat = 6,
  TopMost = 7
}

/**
 * The <i>LVZXType</i> enum. TODO: Document.
 *
 * <ul>
 *      <li> 0 = Normal (no letters in front)
 *      <li> 1 = Screen center
 *      <li> 2 = Bottom right corner
 *      <li> 3 = Stats box, lower right corner
 *      <li> 4 = Top right corner of specials
 *      <li> 5 = Bottom right corner of specials
 *      <li> 6 = Below energy bar & spec data
 *      <li> 7 = Top left corner of chat
 *      <li> 8 = Top left corner of radar
 *      <li> 9 = Top left corner of radar's text (clock/location)
 *      <li> 10 = Top left corner of weapons
 *      <li> 11 = Bottom left corner of weapons
 * </ul>
 *
 * @author Jab
 */
export enum LVZXType {
  SCREEN_LEFT = 0,
  SCREEN_CENTER = 1,
  SCREEN_RIGHT = 2,
  STATS_BOX_RIGHT_EDGE = 3,
  SPECIALS_RIGHT = 4,
  SPECIALS_RIGHT_2 = 5,
  ENERGY_BAR_CENTER = 6,
  CHAT_TEXT_RIGHT_EDGE = 7,
  RADAR_LEFT_EDGE = 8,
  CLOCK_LEFT_EDGE = 9,
  WEAPONS_LEFT = 10,
  WEAPONS_LEFT_2 = 11
}

/**
 * The <i>LVZYType</i> enum. TODO: Document.
 *
 * <ul>
 *      <li> 0 = Normal (no letters in front)
 *      <li> 1 = Screen center
 *      <li> 2 = Bottom right corner
 *      <li> 3 = Stats box, lower right corner
 *      <li> 4 = Top right corner of specials
 *      <li> 5 = Bottom right corner of specials
 *      <li> 6 = Below energy bar & spec data
 *      <li> 7 = Top left corner of chat
 *      <li> 8 = Top left corner of radar
 *      <li> 9 = Top left corner of radar's text (clock/location)
 *      <li> 10 = Top left corner of weapons
 *      <li> 11 = Bottom left corner of weapons
 * </ul>
 *
 * @author Jab
 */
export enum LVZYType {
  SCREEN_TOP = 0,
  SCREEN_CENTER = 1,
  SCREEN_BOTTOM = 2,
  STATS_BOX_BOTTOM_EDGE = 3,
  SPECIALS_TOP = 4,
  SPECIALS_BOTTOM = 5,
  BOTTOM_ENERGY_BAR = 6,
  CHAT_TOP = 7,
  RADAR_TOP = 8,
  CLOCK_TOP = 9,
  WEAPONS_TOP = 10,
  WEAPONS_BOTTOM = 11
}

/**
 * The <i>LVLErrorStatus</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum LVZErrorStatus {
  // GENERAL
  SUCCESS,
  OBJECT_NULL,
  OBJECT_ID_OUT_OF_RANGE,
  X_COORDINATE_OUT_OF_RANGE,
  Y_COORDINATE_OUT_OF_RANGE,
  X_COORDINATE_TYPE_OUT_OF_RANGE,
  Y_COORDINATE_TYPE_OUT_OF_RANGE,
  ANIMATION_TIME_OUT_OF_RANGE,
  IMAGE_NOT_DEFINED,
  DISPLAY_MODE_OUT_OF_RANGE,
  DISPLAY_TIME_OUT_OF_RANGE,
  RENDER_LAYER_OUT_OF_RANGE,
  X_FRAME_COUNT_OUT_OF_RANGE,
  Y_FRAME_COUNT_OUT_OF_RANGE,
  // COMPILED IMAGE
  COMPILED_IMAGE_FILENAME_NULL,
  COMPILED_IMAGE_FILENAME_EMPTY,
  // COMPILED OBJECTS
  IMAGE_INDEX_OUT_OF_RANGE,
  // IMAGE
  IMAGE_RESOURCE_NULL,
  // RESOURCE
  RESOURCE_DATA_NULL,
  RESOURCE_NAME_NULL,
  RESOURCE_NAME_EMPTY,
  RESOURCE_TIME_NEGATIVE,
}
