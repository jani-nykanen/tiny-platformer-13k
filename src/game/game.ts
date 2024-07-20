import { ProgramEvent } from "../core/event.js";
import { Canvas } from "../gfx/canvas.js";
import { Scene, SceneParameter } from "../core/scene.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Flip } from "../gfx/flip.js";
import { Stage } from "./stage.js";
import { Camera } from "./camera.js";
import { ObjectManager } from "./objectmanager.js";
import { TILE_HEIGHT, TILE_WIDTH } from "./tilesize.js";
import { TransitionType } from "../core/transition.js";
import { Align } from "../gfx/align.js";


export class Game implements Scene {


    private camera : Camera;
    private stage : Stage;
    private objects : ObjectManager;


    constructor(event : ProgramEvent) {

        this.camera = new Camera(0, 0, event);
        this.stage = new Stage();
        this.objects = new ObjectManager(this.camera);
        this.camera.restrict(this.stage.width*TILE_WIDTH, this.stage.height*TILE_HEIGHT);
    }


    private reset(event : ProgramEvent) : void {

        // NOTE: This is a bad way to do this, it possibly leaks memory
        // and everything, but since most people don't bother dying in
        // this short demo, doing this in "improper way" saves a lot of
        // bytes!
        this.stage = new Stage();
        this.objects = new ObjectManager(this.camera);
        this.camera.restrict(this.stage.width*TILE_WIDTH, this.stage.height*TILE_HEIGHT);

        event.transition.setCenter(this.camera.getRelativePosition(this.objects.player.getPosition()));
    }


    private drawHUD(canvas : Canvas) : void {

        const ICON_OFF_X : number = 2;
        const ICON_OFF_Y : number = 2;

        const bmpHUD : Bitmap = canvas.assets.getBitmap("h");

        // Health
        const playerHealth : number = this.objects.player.getHealth();
        for (let i = 0; i < this.objects.player.maxHealth; ++ i) {

            const sx : number = playerHealth > i ? 0 : 16;

            canvas.drawBitmap(bmpHUD, Flip.None, ICON_OFF_X + i*14, ICON_OFF_Y, sx, 0, 16, 16);
        }

        // Coins
        const bmpFont : Bitmap = canvas.assets.getBitmap("fo");
        canvas.drawText(bmpFont, "#00", canvas.width - ICON_OFF_X, ICON_OFF_Y - 1, -7, 0, Align.Right);

        canvas.drawBitmap(bmpHUD, Flip.None, canvas.width - ICON_OFF_X - 48, ICON_OFF_Y, 32, 0, 16, 16);
    }

    
    public onChange(param : SceneParameter, event : ProgramEvent): void {

        event.transition.activate(false, TransitionType.Fade, 1.0/30.0);
    }


    public update(event : ProgramEvent) : void {

        if (event.transition.isActive()) {

            this.camera.update(event);
            this.stage.update(event);
            return;
        }

        this.stage.update(event);
        this.objects.update(this.camera, this.stage, event);    
        this.camera.update(event);
        this.camera.restrict(this.stage.width*TILE_WIDTH, this.stage.height*TILE_HEIGHT);

        if (!this.objects.player.doesExist()) {

            event.transition.activate(true, TransitionType.Circle, 1.0/60.0, 
                (event : ProgramEvent) : void => this.reset(event), "#000000",
                this.camera.getRelativePosition(this.objects.player.getPosition()));
        }
    }


    public redraw(canvas : Canvas) : void {
        
        canvas.moveTo();

        this.stage.drawBackground(canvas, this.camera);

        // const bmpGameArt : Bitmap = canvas.assets?.getBitmap("g");
        // canvas.drawBitmap(bmpGameArt, Flip.None, 8, 8);
        // const bmpTileset : Bitmap = canvas.assets?.getBitmap("ts");
        // canvas.drawBitmap(bmpTileset, Flip.None, 96, 8);
        // const bmp : Bitmap = canvas.assets?.getBitmap("fo");
        // canvas.drawBitmap(bmp, Flip.None, 128, 8);
        
        this.camera.apply(canvas);
        this.stage.drawLayers(canvas, this.camera);
        this.objects.draw(canvas);

        canvas.moveTo();
        this.drawHUD(canvas);
    }


    public dispose() : SceneParameter {

        return undefined;
    }
}
