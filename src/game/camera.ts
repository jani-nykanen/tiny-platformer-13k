import { Vector } from "../math/vector.js";
import { ProgramEvent } from "../core/event.js";
import { Canvas } from "../gfx/canvas.js";
import { InputState } from "../core/inputstate.js";
import { Rectangle } from "../math/rectangle.js";
import { GameObject, updateSpeedAxis } from "./gameobject.js";
import { clamp } from "../math/utility.js";


export class Camera {


    private pos : Vector;
    private targetPos : Vector;

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
        this.targetPos = new Vector(x, y);
    }


    public followObject(o : GameObject) : void {

        const HORIZONTAL_THRESHOLD : number = 16;
        const VERTICAL_THRESHOLD : number = 16;

        const HORIZONTAL_CENTER_SHIFT : number = 0.33;
        const VERTICAL_CENTER_SHIFT : number = 0.25;

        const X_OFFSET : number = 0;
        const Y_OFFSET : number = -16;

        const p : Vector = o.getPosition();
        p.x -= this.width*HORIZONTAL_CENTER_SHIFT;
        p.y -= this.height*VERTICAL_CENTER_SHIFT;

        const target : Vector = new Vector(p.x + X_OFFSET, p.y + Y_OFFSET);
        if (Math.abs(target.x - this.pos.x) > HORIZONTAL_THRESHOLD) {

            this.targetPos.x = target.x - Math.sign(target.x - this.pos.x)*HORIZONTAL_THRESHOLD;
        }

        if (Math.abs(target.y - this.pos.y) > VERTICAL_THRESHOLD) {

            this.targetPos.y = target.y - Math.sign(target.y - this.pos.y)*VERTICAL_THRESHOLD;
        }
    }


    public update(event : ProgramEvent) : void {

        const H_FACTOR : number = 8;
        const V_FACTOR : number = 6;

        this.cwidth = event.screenWidth;
        this.cheight = event.screenHeight;

        // Reduces "flickering"
        if (Math.abs(this.pos.x - this.targetPos.x) <= 1) {

            this.targetPos.x = this.pos.x;
        }
        if (Math.abs(this.pos.y - this.targetPos.y) <= 1) {

            this.targetPos.y = this.pos.y;
        }

        this.pos.x = updateSpeedAxis(this.pos.x, 
            this.targetPos.x, 
            (Math.abs(this.pos.x - this.targetPos.x)/H_FACTOR)*event.tick);
        this.pos.y = updateSpeedAxis(this.pos.y, 
            this.targetPos.y, 
            (Math.abs(this.pos.y - this.targetPos.y)/V_FACTOR)*event.tick);
    }


    public restrict(width : number, height : number) : void {

        this.pos.x = clamp(this.pos.x, 0, width - this.cwidth);
        this.pos.y = clamp(this.pos.y, 0, height - this.cheight);

        this.targetPos.x = clamp(this.targetPos.x, 0, width - this.cwidth);
        this.targetPos.y = clamp(this.targetPos.y, 0, height - this.cheight);
    }


    public isInsideVisibleArea(pos : Vector, area : Rectangle) : boolean {

        return false;
    }


    public apply(canvas : Canvas) : void {

        // TODO: round vs floor?
        canvas.moveTo(-(this.pos.x), -(this.pos.y));
    }
}