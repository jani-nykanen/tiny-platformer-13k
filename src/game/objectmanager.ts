import { ProgramEvent } from "../core/event.js";
import { Canvas } from "../gfx/canvas.js";
import { Camera } from "./camera.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";


export class ObjectManager {


    private player : Player;


    constructor() {

        this.player = new Player(64, 128);
    }


    public update(camera : Camera, stage : Stage, event : ProgramEvent) : void {

        this.player.update(event);
    }


    public draw(canvas : Canvas) : void {

        this.player.draw(canvas);
    }
}