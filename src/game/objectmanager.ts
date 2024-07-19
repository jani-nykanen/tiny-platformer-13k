import { ProgramEvent } from "../core/event.js";
import { Canvas } from "../gfx/canvas.js";
import { Camera } from "./camera.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";
import { TILE_HEIGHT } from "./tilesize.js";


export class ObjectManager {


    public readonly player : Player;


    constructor() {

        this.player = new Player(32, 13*TILE_HEIGHT + TILE_HEIGHT/2);
    }


    public update(camera : Camera, stage : Stage, event : ProgramEvent) : void {

        this.player.update(event);
        camera.followObject(this.player);
        stage.objectCollision(this.player, event);
    }


    public draw(canvas : Canvas) : void {

        this.player.draw(canvas);
    }
}