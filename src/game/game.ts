import { ProgramEvent } from "../core/event.js";
import { Canvas } from "../gfx/canvas.js";
import { Scene, SceneParameter } from "../core/scene.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Flip } from "../gfx/flip.js";


export class Game implements Scene {


    constructor(event : ProgramEvent) {

        // TODO: Implement
    }

    
    public onChange(param : SceneParameter, event : ProgramEvent): void {

        // TODO: Implement
    }


    public update(event : ProgramEvent) : void {
        
        // TODO: Implement
    }


    public redraw(canvas : Canvas) : void {
        
        canvas.clear("#55AAFF");

        const bmpGameArt : Bitmap = canvas.assets.getBitmap("g");
        canvas.drawBitmap(bmpGameArt, Flip.None, 8, 8);

        const bmpTileset : Bitmap = canvas.assets.getBitmap("ts");
        canvas.drawBitmap(bmpTileset, Flip.None, 96, 8);
    }


    public dispose() : SceneParameter {

        return undefined;
    }
}
