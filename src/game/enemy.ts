import { Flip } from "../gfx/flip.js";
import { CollisionObject } from "./collisionobject.js";
import { AnimatedSprite } from "../gfx/animatedsprite.js";
import { ProgramEvent } from "../core/event.js";
import { Vector } from "../math/vector.js";
import { Rectangle } from "../math/rectangle.js";
import { Canvas } from "../gfx/canvas.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Player } from "./player.js";


const BASE_SPEED : number = 0.75;
const BASE_GRAVITY : number = 4.0;

const DEATH_TIME : number = 12;


export class Enemy extends CollisionObject {


    private flip : Flip = Flip.None;
    private spr : AnimatedSprite;

    private deathTimer : number = 0;


    constructor(x : number, y : number) {

        super(x, y, true);

        this.spr = new AnimatedSprite(16, 16);

        this.target.x = -BASE_SPEED;
        this.target.y = BASE_GRAVITY;

        this.friction = new Vector(0.20, 0.125);

        this.collisionBox = new Rectangle(0, 2, 12, 12);
        this.hitbox = new Rectangle(0, 2, 12, 12);

        this.cameraCheckArea.w = 32;
    }

    protected die(event : ProgramEvent) : boolean {

        return (this.deathTimer -= event.tick) <= 0;
    }


    protected horizontalCollisionEvent(direction : -1 | 1, event : ProgramEvent) : void {
        
        this.target.x = -Math.abs(this.target.x)*direction;
        this.speed.x = this.target.x;
    }


    public lavaCollision(y : number, event : ProgramEvent) : boolean {
        
        const JUMP_SPEED : number = -4.0;

        if (this.pos.y + this.collisionBox.y + this.collisionBox.h/2 > y) {

            this.pos.y = y - this.collisionBox.y - this.collisionBox.h/2;
            this.speed.y = JUMP_SPEED;
            
            event.audio.playSample("ej", 0.40);

            return true;
        }

        return false;
    }


    protected updateEvent(event : ProgramEvent) : void {
        
        if (this.touchSurface) {

            this.spr.animate(0, 0, 3, 6, event.tick);
        }
        else {

            this.spr.setFrame(4, 0);
        }   
        
        this.flip = this.speed.x > 0 ? Flip.Horizontal : Flip.None;

        this.touchSurface = false;
    }


    public enemyCollision(e : Enemy) : void {

        if (this.dying || !this.exist || e.dying || !e.exist) {

            return;
        } 

        if (this.overlay(e)) {

            this.target.x *= -1;
            e.target.x *= -1;

            this.speed.x = this.target.x;
            e.speed.x = e.target.x;

            // TODO: Also update the x axis, if I happen to find
            // spare space...
        }
    }


    public playerCollision(player : Player, event : ProgramEvent) : void {

        if (this.dying || !this.exist) {

            return;
        } 

        const swordHitbox : Rectangle | undefined = player.getSwordHitbox();
        if (swordHitbox !== undefined) {

            if (Rectangle.overlay(this.hitbox, swordHitbox, this.pos)) {

                this.deathTimer = DEATH_TIME;
                this.dying = true;

                event.audio.playSample("k", 0.60);

                return;
            }
        }

        player.hurtCollision(
            this.pos.x - this.hitbox.x - this.hitbox.w/2, 
            this.pos.y - this.hitbox.y - this.hitbox.h/2, 
            this.hitbox.w, this.hitbox.h, event, false);
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        if (!this.exist) {

            return;
        }

        if (this.dying) {

            // Draw a white ring of death
            const t : number = 1.0 - this.deathTimer/DEATH_TIME;
            const r1 : number = 8 + 8*t;
            const r2 : number = 15*t;

            canvas.setFillColor("#FFFFFF");
            canvas.fillRing(this.pos.x, this.pos.y, r2, r1);

            return;
        }

        const dx : number = this.pos.x - 8;
        const dy : number = this.pos.y - 7;

        this.spr.draw(canvas, bmp, dx, dy, this.flip);
    }
}
