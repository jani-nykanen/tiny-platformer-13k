import { Assets } from "./assets.js";
import { Canvas } from "../gfx/canvas.js";
import { Input } from "./input.js";
import { SceneManager } from "./scenemanager.js";


export class ProgramEvent {


    private readonly canvas : Canvas;

    public readonly input : Input;
    public readonly scenes : SceneManager;
    public readonly assets : Assets;

    public readonly tick : number = 1.0;


    public get screenWidth() : number {

        return this.canvas.width;
    }
    public get screenHeight() : number {

        return this.canvas.height;
    }


    constructor(input : Input, scenes : SceneManager, assets : Assets, canvas : Canvas) {

        this.input = input;
        this.scenes = scenes;
        this.assets = assets;
        this.canvas = canvas;
    }
}
