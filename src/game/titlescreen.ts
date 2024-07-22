import { ProgramEvent } from "../core/event.js";
import { Scene, SceneParameter } from "../core/scene.js";
import { Align } from "../gfx/align.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Canvas } from "../gfx/canvas.js";


const CONTROLS : string =
`ARROW KEYS: MOVE
SPACE OR Z: JUMP
LCTRL OR X: ATTACK
`;


export class TitleScreen implements Scene {


    private flickerTime : number = 0.0;


    public update(event : ProgramEvent) : void {
        
        if (event.input.anyPressed) {

            event.audio.playSample("s", 0.40);
            event.scenes.changeScene("g", event);
        }

        this.flickerTime = (this.flickerTime + 1.0/60.0*event.tick) % 1.0;
    }


    public redraw(canvas : Canvas) : void {
        
        canvas.clear("#000000");

        const bmpFont : Bitmap = canvas.getBitmap?.("fw");
        const bmpFontYellow : Bitmap = canvas.getBitmap?.("fy");

        const middle : number = canvas.width/2;

        canvas.drawText(bmpFont, "TINY-PLATFORMER-13K", middle, 32, -1, 0, Align.Center);
        canvas.drawText(bmpFont, "PROTOTYPE", middle, 42, -1, 0, Align.Center);

        canvas.drawText(bmpFont, CONTROLS, middle - 56, 92, -1, 4, Align.Left);

        if (this.flickerTime <= 0.5) {
        
            canvas.drawText(bmpFontYellow, "PRESS ANY KEY", middle, canvas.height - 32, -1, 0, Align.Center);
        }
    }

}
