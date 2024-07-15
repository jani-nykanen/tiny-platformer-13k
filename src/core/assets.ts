import { Bitmap } from "../gfx/bitmap.js";


export class Assets {


    private loadCount : number = 0;
    private assetCount : number = 0;

    private bitmaps : Map<string, Bitmap>;


    constructor() {

        this.bitmaps = new Map<string, Bitmap> ();
    }


    public addBitmap(name : string, bmp : Bitmap) : void {

        this.bitmaps.set(name, bmp);
    }


    public getBitmap(name : string) : Bitmap | undefined {

        return this.bitmaps.get(name);
    }


    public loadBitmap(name : string, path : string) : void {

        ++ this.assetCount;

        const img : HTMLImageElement = new Image();
        img.onload = (_ : Event) : void => {

            ++ this.loadCount;
            this.bitmaps.set(name, img);
        }
        img.src = path;
    }


    public loaded = () : boolean => this.loadCount >= this.assetCount;
    public loadedRatio = () : number => this.assetCount == 0 ? 1.0 : this.loadCount/this.assetCount;
}
