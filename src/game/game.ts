import { ProgramEvent } from "../core/event.js";
import { Canvas } from "../gfx/canvas.js";
import { Scene, SceneParameter } from "../core/scene.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Flip } from "../gfx/flip.js";
import { Stage } from "./stage.js";
import { Camera } from "./camera.js";


export class Game implements Scene {


    private camera : Camera;
    private stage : Stage;


    constructor(event : ProgramEvent) {

        this.camera = new Camera(0, 0, event);
        this.stage = new Stage();
    }

    
    public onChange(param : SceneParameter, event : ProgramEvent): void {

        // TODO: Implement
    }


    public update(event : ProgramEvent) : void {
        
        this.camera.update(event);
    }


    public redraw(canvas : Canvas) : void {
        
        canvas.moveTo();
        canvas.clear("#55AAFF");

        /*
        const bmpGameArt : Bitmap = canvas.assets.getBitmap("g");
        canvas.drawBitmap(bmpGameArt, Flip.None, 8, 8);

        const bmpTileset : Bitmap = canvas.assets.getBitmap("ts");
        canvas.drawBitmap(bmpTileset, Flip.None, 96, 8);
        */

        this.camera.apply(canvas);
        this.stage.drawLayers(canvas, this.camera);

        canvas.moveTo();
        // TODO: Draw HUD etc.
    }


    public dispose() : SceneParameter {

        return undefined;
    }
}
