import { Vector } from "../math/vector.js";
import { ProgramEvent } from "../core/event.js";
import { Canvas } from "../gfx/canvas.js";
import { InputState } from "../core/inputstate.js";
import { Rectangle } from "../math/rectangle.js";


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

        this.cwidth = event.screenWidth;
        this.cheight = event.screenHeight;
    }


    public isInsideVisibleArea(pos : Vector, area : Rectangle) : boolean {

        return false;
    }


    public apply(canvas : Canvas) : void {

        // TODO: round vs floor?
        canvas.moveTo(-Math.floor(this.pos.x), -Math.floor(this.pos.y));
    }
}
