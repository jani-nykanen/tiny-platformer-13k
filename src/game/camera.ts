import { Vector } from "../math/vector.js";
import { ProgramEvent } from "../core/event.js";
import { Canvas } from "../gfx/canvas.js";
import { InputState } from "../core/inputstate.js";


export class Camera {


    private pos : Vector;

    private cwidth : number
    private cheight : number;


    public get width() : number {

        return this.cwidth;
    }
    public get height() : number {

        return this.cheight;
    }
    public get top() : number {

        return this.pos.y;
    }
    public get left() : number {

        return this.pos.x;
    }


    constructor(x : number, y : number, event : ProgramEvent) {

        this.cwidth = event.screenWidth;
        this.cheight = event.screenHeight;

        this.pos = new Vector(x, y);
    }


    public update(event : ProgramEvent) : void {

        const TEMP_MOVE_SPEED : number = 4;

        this.cwidth = event.screenWidth;
        this.cheight = event.screenHeight;

        // Temporary control
        if (event.input.getAction("r") & InputState.DownOrPressed) {

            this.pos.x += TEMP_MOVE_SPEED*event.tick;
        }
        else if (event.input.getAction("l") & InputState.DownOrPressed) {

            this.pos.x -= TEMP_MOVE_SPEED*event.tick;
        }
    }


    public apply(canvas : Canvas) : void {

        // TODO: round vs floor?
        canvas.moveTo(-Math.floor(this.pos.x), -Math.floor(this.pos.y));
    }
}
