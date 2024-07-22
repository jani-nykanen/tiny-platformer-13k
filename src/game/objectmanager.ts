import { ProgramEvent } from "../core/event.js";
import { Canvas } from "../gfx/canvas.js";
import { Camera } from "./camera.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";
import { TILE_HEIGHT, TILE_WIDTH } from "./tilesize.js";
import { Enemy } from "./enemy.js";
import { Bitmap } from "../gfx/bitmap.js";


export class ObjectManager {


    private enemies : Enemy[];


    public readonly player : Player;


    constructor(camera : Camera, stage : Stage) {

        this.player = new Player(32, 13*TILE_HEIGHT + TILE_HEIGHT/2);
        camera.followObject(this.player);
        camera.moveToTarget();

        this.enemies = new Array<Enemy> ();
        stage.iterateEnemyLocations((x : number, y : number) : void => {

            this.enemies.push(new Enemy((x + 0.5)*TILE_WIDTH, (y + 0.5)*TILE_HEIGHT));
        })
    }


    public update(camera : Camera, stage : Stage, event : ProgramEvent) : void {

        this.player.update(event);
        camera.followObject(this.player);
        stage.objectCollision(this.player, event);

        for (let i = 0; i < this.enemies.length; ++ i) {

            const e : Enemy = this.enemies[i];

            e.cameraCheck(camera, event);

            e.update(event);
            stage.objectCollision(e, event);

            // TODO: Enemy-to-enemy collisions, if space allows
            if (e.doesExist() && !e.isDying()) {

                for (let j = i + 1; j < this.enemies.length; ++ j) {
                    
                    e.enemyCollision(this.enemies[j]);
                }
                e.playerCollision(this.player, event);
            }
        }

        // Don't have room for a better ending, sorry
        if (this.player.getPosition().x > ((132 + 0.50)*TILE_WIDTH)) {

            event.audio.playSample("e", 0.60);

            throw new Error("Sorry, didn't have room for an ending!\n");
        }
    }


    public initialCameraCheck(camera : Camera, event : ProgramEvent) : void {

        for (const e of this.enemies) {

            e.cameraCheck(camera, event);
        }
    }


    public draw(canvas : Canvas) : void {

        const bmpEnemy : Bitmap = canvas.getBitmap?.("e");
        for (const e of this.enemies) {

            e.draw(canvas, bmpEnemy);
        }

        this.player.draw(canvas);

    }
}