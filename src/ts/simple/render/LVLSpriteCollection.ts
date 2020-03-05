import { MapSprite, MapSpriteCollection } from './MapSprite';

export class LVLSpriteCollection extends MapSpriteCollection {

    mapSpriteFlag: MapSprite;
    mapSpriteGoal: MapSprite;
    mapSpritePrize: MapSprite;
    mapSpriteOver1: MapSprite;
    mapSpriteOver2: MapSprite;
    mapSpriteOver3: MapSprite;
    mapSpriteOver4: MapSprite;
    mapSpriteOver5: MapSprite;
    mapSpriteDoor1: MapSprite;
    mapSpriteDoor2: MapSprite;

    constructor() {

        super();

        this.mapSpriteFlag = new MapSprite(16, 16, 10, 2, 90, 0, 0, 9, 0);
        this.mapSpriteGoal = new MapSprite(16, 16, 9, 2, 90, 0, 1, 8, 1);
        this.mapSpriteOver1 = new MapSprite(16, 16, 15, 2, 80);
        this.mapSpriteOver2 = new MapSprite(32, 32, 10, 3, 80);
        this.mapSpriteOver3 = new MapSprite(16, 16, 15, 2, 80);
        this.mapSpriteOver4 = new MapSprite(96, 96, 5, 2, 80);
        this.mapSpriteOver5 = new MapSprite(80, 80, 4, 6, 80);
        this.mapSpritePrize = new MapSprite(16, 16, 10, 1, 80);
        this.mapSpriteDoor1 = new MapSprite(16, 16, 19, 10, 80, 9, 8, 12, 8);
        this.mapSpriteDoor2 = new MapSprite(16, 16, 19, 10, 80, 13, 8, 16, 8);

        this.addSprite(this.mapSpriteFlag);
        this.addSprite(this.mapSpriteGoal);
        this.addSprite(this.mapSpriteOver1);
        this.addSprite(this.mapSpriteOver2);
        this.addSprite(this.mapSpriteOver3);
        this.addSprite(this.mapSpriteOver4);
        this.addSprite(this.mapSpriteOver5);
        this.addSprite(this.mapSpritePrize);
        this.addSprite(this.mapSpriteDoor1);
        this.addSprite(this.mapSpriteDoor2);
    }

    reset() {
        this.mapSpriteFlag.reset();
        this.mapSpriteGoal.reset();
        this.mapSpritePrize.reset();
        this.mapSpriteOver1.reset();
        this.mapSpriteOver2.reset();
        this.mapSpriteOver3.reset();
        this.mapSpriteOver4.reset();
        this.mapSpriteOver5.reset();
        this.mapSpriteDoor1.reset();
        this.mapSpriteDoor2.reset();
    }
}
