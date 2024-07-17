import { ProgramEvent } from "../core/event.js";
import { InputState } from "../core/inputstate.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Canvas } from "../gfx/canvas.js";
import { Rectangle } from "../math/rectangle.js";
import { Vector } from "../math/vector.js";
import { Camera } from "./camera.js";
import { CollisionObject } from "./collisionobject.js";


export class Player extends CollisionObject {


    private jumpTimer : number = 0.0;
    private ledgeTimer : number = 0.0;
    private touchSurface : boolean = true;


    constructor(x : number, y : number) {

        super(x, y, true);

        this.friction = new Vector(0.20, 0.125);

        this.collisionBox = new Rectangle(0, 2, 12, 12);
        this.hitbox = new Rectangle(0, 0, 16, 16);

        this.inCamera = true;
    }


    private control(event : ProgramEvent) : void {

        const JUMP_TIME : number = 18.0;
        const WALK_SPEED : number = 1.5;
        const BASE_GRAVITY : number = 4.0;

        let dirx : number = 0.0

        if ((event.input.getAction("l") & InputState.DownOrPressed) != 0) {

            dirx = -1;
        }
        else if ((event.input.getAction("r") & InputState.DownOrPressed) != 0) {

            dirx = 1;
        }

        this.target.x = dirx*WALK_SPEED;
        this.target.y = BASE_GRAVITY;

        const jumpButton : InputState = event.input.getAction("j");
        if (jumpButton == InputState.Pressed && this.ledgeTimer > 0) {

            this.jumpTimer = JUMP_TIME;
            this.ledgeTimer = 0.0;
        }
        else if ((jumpButton & InputState.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }
    }


    private updateJumping(event : ProgramEvent) : void {

        const JUMP_SPEED : number = -2.5;

        if (this.ledgeTimer > 0) {

            this.ledgeTimer -= event.tick;
        }

        if (this.jumpTimer <= 0) {

            return;
        }

        this.speed.y = JUMP_SPEED;
        this.target.y = this.speed.y;
        
        this.jumpTimer -= event.tick;
    }


    protected updateEvent(event : ProgramEvent) : void {
        
        this.control(event);
        this.updateJumping(event);

        this.touchSurface = false;
    }


    protected verticalCollisionEvent(direction : 1 | -1, event : ProgramEvent) : void {
        
        const LEDGE_TIME : number = 8.0;

        if (direction == 1) {

            this.ledgeTimer = LEDGE_TIME;
            this.touchSurface = true;
        }
        else {

            this.jumpTimer = 0;
        }
    }


    public draw(canvas : Canvas, bmp? : Bitmap | undefined) : void {
        
        const dx : number = Math.round(this.pos.x) - 8;
        const dy : number = Math.round(this.pos.y) - 7;

        canvas.setFillColor("#000000");
        canvas.fillRect(dx, dy, 16, 16);
        canvas.setFillColor("#FF0000");
        canvas.fillRect(dx + 1, dy + 1, 14, 14);
    }
}
