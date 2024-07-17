import { Bitmap } from "../gfx/bitmap.js";
import { Canvas } from "../gfx/canvas.js";
import { LEVEL_DATA } from "./leveldata.js";
import { Tilemap } from "./tilemap.js";
import { Camera } from "./camera.js";
import { TILE_WIDTH, TILE_HEIGHT } from "./tilesize.js";
import { Flip } from "../gfx/flip.js";


export class Stage {


    private baseMap : Tilemap;

    private staticTiles : number[][];

    public readonly width : number;
    public readonly height : number;


    constructor() {

        this.baseMap = new Tilemap(LEVEL_DATA);

        this.width = this.baseMap.width;
        this.height = this.baseMap.height;

        this.staticTiles = new Array<number[]> (this.baseMap.layerCount);
        for (let i = 0; i < this.baseMap.layerCount; ++ i) {

            // We assume that the first 128 tiles are "normal", and 
            // the rest are possibly objects
            this.staticTiles[i] = this.baseMap.cloneLayer(i, 128) ?? [];
        }
    }


    private getTile(layer : number, x : number, y : number, def : number = 0) : number {

        if (layer < 0 || layer >= this.staticTiles.length ||
            x < 0 || y < 0 || x >= this.width || y >= this.height) {

            return def;
        }
        return this.staticTiles[layer][y*this.width + x];
    }


    public drawLayers(canvas : Canvas, camera : Camera) : void {

        const CAMERA_MARGIN : number = 1;

        const bmpTileset : Bitmap = canvas.assets.getBitmap("ts");

        const startx : number = ((camera.left/TILE_WIDTH) | 0) - CAMERA_MARGIN;
        const starty : number = ((camera.top/TILE_HEIGHT) | 0) - CAMERA_MARGIN;

        const endx : number = startx + ((camera.width/TILE_WIDTH) | 0) + CAMERA_MARGIN*2;
        const endy : number = starty + ((camera.height/TILE_HEIGHT) | 0) + CAMERA_MARGIN*2;

        for (let l = 0; l < this.staticTiles.length; ++ l) {

            for (let y = starty; y <= endy; ++ y) {

                for (let x = startx; x <= endx; ++ x) {

                    const tileID : number = this.getTile(l, x, y);
                    if (tileID == 0) {

                        continue;
                    }

                    const sx : number = (tileID - 1) % 16;
                    const sy : number = ((tileID - 1)/16) | 0;

                    canvas.drawBitmap(bmpTileset, Flip.None, 
                        x*TILE_WIDTH, y*TILE_HEIGHT, 
                        sx*TILE_WIDTH, sy*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                }
            }
        }

    }
}