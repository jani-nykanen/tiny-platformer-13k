import { Assets } from "./assets.js";
import { ProgramEvent } from "./event.js";
import { Canvas } from "../gfx/canvas.js";
import { Input } from "./input.js";
import { SceneManager } from "./scenemanager.js";



export class Program {


    private input : Input;
    private canvas : Canvas;
    private scenes : SceneManager;
    private assets : Assets;
    private event : ProgramEvent;
    
    private timeSum : number = 0.0;
    private oldTime : number = 0.0;

    private initialized : boolean = false;

    private animationRequest : number | undefined = undefined;


    constructor(ctx : AudioContext, 
        canvasMinWidth : number,  canvasMaxWidth : number,
        canvasMinHeight : number,  canvasMaxHeight : number,) {
        
        this.input = new Input();
        this.scenes = new SceneManager();
        this.assets = new Assets();

        this.canvas = new Canvas(
            canvasMinWidth, canvasMaxWidth,
            canvasMinHeight, canvasMaxHeight,
            this.assets);
        this.event = new ProgramEvent(this.input, this.scenes, this.assets, this.canvas); 
    }


    private loop(ts : number, 
        onError? : (e : Error) => void, 
        onLoad? : (event : ProgramEvent) => void) : void {

        const MAX_REFRESH_COUNT : number = 5; 
        const BASE_FRAME_TIME : number = 1000.0/60.0;
    
        const frameTime : number = BASE_FRAME_TIME*this.event.tick;
        const loaded : boolean = this.assets.loaded();

        this.timeSum = Math.min(this.timeSum + (ts - this.oldTime), MAX_REFRESH_COUNT*frameTime);
        this.oldTime = ts;

        try {

            if (loaded && !this.initialized) {

                onLoad?.(this.event);
                this.scenes.activeScene?.onChange?.(undefined, this.event);
                this.initialized = true;
            }

            let firstFrame : boolean = true;
            for (; this.timeSum >= frameTime; this.timeSum -= frameTime) {

                if (loaded) {

                    this.scenes.activeScene?.update(this.event);
                }
                
                if (firstFrame) {

                    this.event.input.update();
                    firstFrame = false;
                }
            }
            
            if (loaded) {
                
                this.scenes.activeScene?.redraw(this.canvas);
            }
            else {

                // TODO: Draw a loading screen
                this.canvas.clear("#0055aa");
            }
        }
        catch (e : any) {

            if (this.animationRequest !== undefined) {

                window.cancelAnimationFrame(this.animationRequest);
            }
            onError?.(e);
            return;
        }

        this.animationRequest = window.requestAnimationFrame(ts => this.loop(ts, onError, onLoad));
    }


    public run(onError? : (e : Error) => void,
        initialEvent? : (event : ProgramEvent) => void,
        onLoad? : (event : ProgramEvent) => void) : void {

        initialEvent?.(this.event);
        this.loop(0.0, onError, onLoad);
    }
}
