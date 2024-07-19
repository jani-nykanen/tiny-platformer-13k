import { ProgramEvent } from "../core/event.js";
import { InputState } from "../core/inputstate.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Canvas } from "../gfx/canvas.js";
import { Rectangle } from "../math/rectangle.js";
import { Vector } from "../math/vector.js";
import { AnimatedSprite } from "../gfx/animatedsprite.js";
import { CollisionObject } from "./collisionobject.js";
import { Flip } from "../gfx/flip.js";


const HURT_TIME : number = 60;
const HURT_KNOCKBACK_TIME : number = 20;


export class Player extends CollisionObject {


    private jumpTimer : number = 0.0;
    private ledgeTimer : number = 0.0;
    private touchSurface : boolean = true;

    private bodySprite : AnimatedSprite;
    private flip : Flip = Flip.None;

    private attackTimer : number = 0;
    private canAttack : boolean = true;

    private hurtTimer : number = 0;
    private health : number = 3;

    public readonly maxHealth : number = 3;


    constructor(x : number, y : number) {

        super(x, y, true);

        this.friction = new Vector(0.20, 0.125);

        this.collisionBox = new Rectangle(0, 2, 12, 12);
        this.hitbox = new Rectangle(0, 0, 16, 16);

        this.inCamera = true;

        this.bodySprite = new AnimatedSprite(16, 16);
    }


    private control(event : ProgramEvent) : void {

        const ATTACK_TIME : number = 15.0;
        const JUMP_TIME : number = 18.0;
        const WALK_SPEED : number = 1.5;
        const BASE_GRAVITY : number = 4.0;

        if (this.attackTimer > 0) {

            this.attackTimer -= event.tick;
            return;
        }

        this.target.y = BASE_GRAVITY;
        if (this.hurtTimer > HURT_TIME) {

            return;
        }

        // Walking
        let dirx : number = 0.0;
        if ((event.input.getAction("l") & InputState.DownOrPressed) != 0) {

            dirx = -1;
            this.flip = Flip.Horizontal;
        }
        else if ((event.input.getAction("r") & InputState.DownOrPressed) != 0) {

            dirx = 1;
            this.flip = Flip.None;
        }
        this.target.x = dirx*WALK_SPEED;

        // Jumping
        const jumpButton : InputState = event.input.getAction("j");
        if (jumpButton == InputState.Pressed && this.ledgeTimer > 0) {

            this.jumpTimer = JUMP_TIME;
            this.ledgeTimer = 0.0;
        }
        else if ((jumpButton & InputState.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }

        // Attacking
        const attackButton : InputState = event.input.getAction("a");
        if (this.canAttack && attackButton == InputState.Pressed) {

            this.attackTimer = ATTACK_TIME;
            this.jumpTimer = 0;

            this.speed.zeros();
            this.target.zeros();
        
            this.canAttack = false;
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


    private updateHurt(event : ProgramEvent) : void {

        if (this.hurtTimer <= 0) {

            return;
        }
        this.hurtTimer -= event.tick;
    }

    
    private animate(event : ProgramEvent) : void {

        const EPS : number = 0.01;

        if (this.hurtTimer > HURT_TIME) {

            this.bodySprite.setFrame(10, 0);
            return;
        }

        if (this.attackTimer > 0) {

            this.bodySprite.setFrame(7, 0);
            return;
        }

        if (!this.touchSurface) {

            this.bodySprite.setFrame(5 + Number(this.speed.y > 0), 0);
            return;
        }

        if (Math.abs(this.target.x) < EPS && Math.abs(this.speed.x) < EPS) {

            this.bodySprite.setFrame(0, 0);
            return;
        }

        const speed : number = Math.max(0, 12 - Math.abs(this.speed.x)*4) | 0;
        this.bodySprite.animate(0, 1, 4, speed, event.tick);
    }


    protected updateEvent(event : ProgramEvent) : void {
        
        this.control(event);
        this.updateJumping(event);
        this.animate(event);
        this.updateHurt(event);

        this.touchSurface = false;
    }


    protected verticalCollisionEvent(direction : 1 | -1, event : ProgramEvent) : void {
        
        const LEDGE_TIME : number = 8.0;

        if (direction == 1) {

            this.ledgeTimer = LEDGE_TIME;
            this.touchSurface = true;
            this.canAttack = true;
        }
        else {

            this.jumpTimer = 0;
        }
    }


    public hurt(dir : -1 | 1, event : ProgramEvent) : void {

        const KNOCKBACK_SPEED : number = 3.0;

        if (this.hurtTimer > 0) {

            return;
        }
        this.hurtTimer = HURT_TIME + HURT_KNOCKBACK_TIME;
        this.speed.x = dir*KNOCKBACK_SPEED;
        this.target.x = 0.0;

        this.attackTimer = 0;
        this.jumpTimer = 0;

        -- this.health;
    }


    public coinCollision(x : number, y : number, radius : number, event : ProgramEvent) : boolean {

        if (!this.exist || this.dying) {

            return false;
        }

        return Rectangle.overlay(this.hitbox, new Rectangle(x, y, radius*2, radius*2), this.pos);
    }


    public hurtCollision(x : number, y : number, w : number, h : number, event : ProgramEvent) : boolean {
        
        if (!this.exist || this.dying || this.hurtTimer > 0) {

            return false;
        }

        const dx : number = x + w/2;
        if (Rectangle.overlay(this.hitbox, new Rectangle(dx, y + h/2, w, h), this.pos)) {

            this.hurt(dx > this.pos.x ? -1 : 1, event);
            return true;
        }
        return false;
    }


    public draw(canvas : Canvas) : void {

        if (this.hurtTimer > 0 && this.hurtTimer <= HURT_TIME &&
            ((this.hurtTimer/2) | 0) % 2 != 0) {

            return;
        }

        const dx : number = this.pos.x - 8;
        const dy : number = this.pos.y - 7;

        const bmpPlayer : Bitmap = canvas.assets?.getBitmap("p");
        this.bodySprite.draw(canvas, bmpPlayer, dx, dy, this.flip);

        if (this.attackTimer > 0) {
            
            const swordX : number = dx + 15 - 46*this.flip;
            canvas.drawBitmap(bmpPlayer, this.flip, swordX, dy + 6, 128, 0, 32, 16);
        }
    }


    public getHealth = () : number => this.health;
}
