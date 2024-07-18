import { ExistingObject } from "./existingobject.js";
import { Vector } from "../math/vector.js";
import { Rectangle } from "../math/rectangle.js";
import { ProgramEvent } from "../core/event.js";
import { Camera } from "./camera.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Canvas } from "../gfx/canvas.js";


export const updateSpeedAxis = (speed : number, target : number, step : number) : number => {

    if (speed < target) {

        return Math.min(target, speed + step);
    }
    return Math.max(target, speed - step);
}


export class GameObject implements ExistingObject {


    protected exist : boolean = true;
    protected dying : boolean = false;

    protected pos : Vector;
    protected oldPos : Vector;

    protected speed : Vector;
    protected target : Vector;
    protected friction : Vector;

    protected hitbox : Rectangle;

    protected inCamera : boolean = false;
    protected cameraCheckArea : Rectangle;


    constructor(x : number = 0, y : number = 0, exist : boolean = false) {

        this.pos = new Vector(x, y);
        this.oldPos = this.pos.clone();

        this.speed = new Vector();
        this.target = new Vector();
        this.friction = new Vector(1, 1);

        this.cameraCheckArea = new Rectangle(0, 0, 128, 128);

        this.hitbox = new Rectangle(0, 0, 16, 16)

        this.exist = exist;
    }


    protected updateEvent?(event : ProgramEvent) : void;
    protected postMovementEvent?(event : ProgramEvent) : void;
    protected cameraEvent?(enteredCamera : boolean, camera : Camera, event : ProgramEvent) : void;
    protected die?(event : ProgramEvent) : boolean;


    protected updateMovement(event : ProgramEvent) : void {

        this.speed.x = updateSpeedAxis(this.speed.x, this.target.x, this.friction.x*event.tick);
        this.speed.y = updateSpeedAxis(this.speed.y, this.target.y, this.friction.y*event.tick);

        this.pos.x += this.speed.x*event.tick;
        this.pos.y += this.speed.y*event.tick;
    }


    public draw?(canvas : Canvas, bmp? : Bitmap | undefined) : void;


    public update(event : ProgramEvent) : void {

        if (!this.exist) 
            return;

        if (!this.inCamera) {

            if (this.dying) {

                this.dying = false;
                this.exist = false;
            }
            return;
        }

        this.oldPos = this.pos.clone();

        if (this.dying) {

            if (this.die?.(event) ?? true) {

                this.exist = false;
                this.dying = false;
            }
            return;
        }

        this.updateEvent?.(event);
        this.updateMovement(event);
        this.postMovementEvent?.(event);
    }


    public cameraCheck(camera : Camera, event : ProgramEvent) : void {

        if (!this.exist) {

            return;
        }
        
        const wasInCamera : boolean = this.inCamera;
        this.inCamera = camera.isInsideVisibleArea(this.pos, this.cameraCheckArea);

        const enteredCamera : boolean = this.inCamera && this.inCamera != wasInCamera;
        this.cameraEvent?.(enteredCamera, camera, event);
        
        if (this.dying && !this.inCamera) {

            this.exist = false;
        }
    }

    
    public doesExist = () : boolean => this.exist;
    public isDying = () : boolean => this.dying;
    public isInCamera = () : boolean => this.inCamera;
    public isActive = () : boolean => this.exist && !this.dying && this.inCamera;

    public getPosition = () : Vector => this.pos.clone();
    public getSpeed = () : Vector => this.speed.clone();
    public getHitbox = () : Rectangle => this.hitbox.clone();


    public overlayRect = (target : Rectangle) : boolean => Rectangle.overlay(this.hitbox, target, this.pos);
    public overlay = (o : GameObject) : boolean => Rectangle.overlay(this.hitbox, o.hitbox, this.pos, o.pos);


    public forceKill() : void {
        
        this.exist = false;
        this.dying = false;
    }

}