import { ProgramEvent } from "./core/event.js";
import { Program } from "./core/program.js";
import { Game } from "./game/game.js";
import { generateAssets } from "./game/assetgenerator.js";


const initialEvent = (event : ProgramEvent) : void => {

    event.assets.loadBitmap("_f", "assets/font.png");
    event.assets.loadBitmap("_g", "assets/gameart.png");
}


const onloadEvent = (event : ProgramEvent) : void => {

    event.input.addAction("l", ["ArrowLeft"]);
    event.input.addAction("r", ["ArrowRight"]);
    event.input.addAction("j", ["Space", "KeyZ"]);
    event.input.addAction("a", ["ControlLeft", "KeyX"]);

    event.scenes.addScene("game", new Game(event), true);

    generateAssets(event.assets, event.audio);
}


const printError = (e : Error) : void => {

    console.log(e.stack);

    document.getElementById("base_div")?.remove();

    const textOut : HTMLElement = document.createElement("b");
    textOut.setAttribute("style", "color: rgb(224,73,73); font-size: 16px");
    textOut.innerText = "Fatal error:\n\n " + e.message;

    document.body.appendChild(textOut);
}


function waitForInitialEvent() : Promise<AudioContext> {

    return new Promise<AudioContext> ( (resolve : (ctx : AudioContext | PromiseLike<AudioContext>) => void) : void => {

        window.addEventListener("keydown", (e : KeyboardEvent) => {

            e.preventDefault();
            document.getElementById("div_initialize")?.remove();
    
            const ctx : AudioContext = new AudioContext();
            resolve(ctx);
    
        }, { once: true });
    } );
}


window.onload = () => (async () => {
    
    document.getElementById("init_text")!.innerText = "Press Any Key to Start";

    const ctx : AudioContext = await waitForInitialEvent();
    try {

        (new Program(256, 1024, 192, 192, ctx, 0.80)).run(printError, initialEvent, onloadEvent);
    }
    catch (e : any) {

        printError(e);
    }
}) ();
