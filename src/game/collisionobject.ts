import { ProgramEvent } from "../core/event.js";
import { Rectangle } from "../math/rectangle.js";
import { GameObject } from "./gameobject.js";


export class CollisionObject extends GameObject {


    protected collisionBox : Rectangle;
    protected takeCollisions : boolean = true;


    constructor(x : number = 0, y : number = 0, exist : boolean = false) {

        super(x, y, exist);

        this.collisionBox = new Rectangle(0, 0, 16, 16);
    }


    protected verticalCollisionEvent?(direction : -1 | 1, event : ProgramEvent) : void;
    protected horizontalCollisionEvent?(direction : -1 | 1, event : ProgramEvent) : void;


    public coinCollision?(x : number, y : number, radius : number, event : ProgramEvent) : boolean;
    public hurtCollision?(x : number, y : number, w : number, h : number, event : ProgramEvent) : boolean;
    public lavaCollision?(y : number, event : ProgramEvent) : boolean;


    public verticalCollision(x : number, y : number, 
        width : number, direction : -1 | 1, event : ProgramEvent) : boolean {

        const SAFE_MARGIN_NEAR : number = 1.0;
        const SAFE_MARGIN_FAR : number = 4.0;

        if (!this.takeCollisions || !this.isActive()) {

            return false;
        }

        const px : number = this.pos.x + this.collisionBox.x - this.collisionBox.w/2;
        const py : number = this.pos.y + this.collisionBox.y + this.collisionBox.h/2*direction;
        const oldY : number = this.oldPos.y + this.collisionBox.y + this.collisionBox.h/2*direction;

        if (px > x + width || px + this.collisionBox.w < x || this.speed.y*direction < 0) {

            return false;
        }

        if ((direction > 0 && 
            py >= y - SAFE_MARGIN_NEAR*event.tick &&
            oldY <= y + (SAFE_MARGIN_FAR + Math.abs(this.speed.y))*event.tick) ||
            (direction < 0 && 
            py <= y + SAFE_MARGIN_NEAR*event.tick &&
            oldY >= y - (SAFE_MARGIN_FAR + Math.abs(this.speed.y))*event.tick )) {

            this.pos.y = y - this.collisionBox.y - this.collisionBox.h/2*direction;
            this.speed.y = 0.0;
                
            this.verticalCollisionEvent?.(direction, event);

            return true;
        }
        return false;
    }


    public horizontalCollision(x : number, y : number, 
        height : number, direction : -1 | 1, event : ProgramEvent) : boolean {
            
        const SAFE_MARGIN_NEAR : number = 1.0;
        const SAFE_MARGIN_FAR : number = 4.0;
    
        if (!this.takeCollisions || !this.isActive()) {
    
            return false;
        }
    
        const px : number = this.pos.x + this.collisionBox.x + this.collisionBox.w/2*direction;
        const py : number = this.pos.y + this.collisionBox.y - this.collisionBox.h/2;
        const oldX : number = this.oldPos.x + this.collisionBox.x + this.collisionBox.w/2*direction;
    
        if (py > y + height || py + this.collisionBox.h < y || this.speed.x*direction < 0) {
    
            return false;
        }
    
        if ((direction > 0 && 
            px >= x - (SAFE_MARGIN_NEAR)*event.tick &&
            oldX <= x + (SAFE_MARGIN_FAR + Math.abs(this.speed.x))*event.tick) ||
            (direction < 0 && 
            px <= x + (SAFE_MARGIN_NEAR)*event.tick &&
            oldX >= x - (SAFE_MARGIN_FAR + Math.abs(this.speed.x))*event.tick )) {
    
            this.pos.x = x - this.collisionBox.x - this.collisionBox.w/2*direction;
            this.speed.x = 0.0;
                
            this.horizontalCollisionEvent?.(direction, event);
    
            return true;
        }
        return false;
    }


    public nudgeDown(power : number, event : ProgramEvent) : void {

        this.pos.y += power*event.tick;
        this.speed.y = power;
    }


    public getCollisionBox = () : Rectangle => this.collisionBox.clone();
    public doesTakeCollisions = () : boolean => this.takeCollisions;
}
