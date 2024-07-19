import { Bitmap } from "../gfx/bitmap.js";
import { Canvas } from "../gfx/canvas.js";
import { COLLISION_DATA, LEVEL_DATA } from "./leveldata.js";
import { Tilemap } from "./tilemap.js";
import { Camera } from "./camera.js";
import { TILE_WIDTH, TILE_HEIGHT } from "./tilesize.js";
import { Flip } from "../gfx/flip.js";
import { CollisionObject } from "./collisionobject.js";
import { ProgramEvent } from "../core/event.js";
import { Vector } from "../math/vector.js";
import { AnimatedSprite } from "../gfx/animatedsprite.js";
import { SKY_COLOR } from "./skycolor.js";


const BUMP_TIME : number = 6.0;


const enum CollisionBit {

    None = 0,

    Top    = 0b1,
    Right  = 0b10,
    Bottom = 0b100,
    Left   = 0b1000,

    SpikeBottom = 0b10000,
    StarBlock   = 0b100000,
    Coin        = 0b1000000
}


export class Stage {


    private baseMap : Tilemap;
    private collisionMap : Tilemap;

    private staticTiles : number[][];
    private collisions : number[];

    private bumpTimer : number = 0;
    private bumpPos : Vector;

    private sprCoin : AnimatedSprite;
    
    private cloudPositions : number[];
    private waterWave : number = 0.0;

    public readonly width : number;
    public readonly height : number;


    constructor() {

        this.baseMap = new Tilemap(LEVEL_DATA);
        this.collisionMap = new Tilemap(COLLISION_DATA);

        this.width = this.baseMap.width;
        this.height = this.baseMap.height;

        this.staticTiles = new Array<number[]> (this.baseMap.layerCount);
        for (let i = 0; i < this.baseMap.layerCount; ++ i) {

            // We assume that the first 128 tiles are "normal", and 
            // the rest are possibly objects
            this.staticTiles[i] = this.baseMap.cloneLayer(i, 128) ?? [];
        }

        this.collisions = new Array<number> (this.width*this.height);
        this.createCollisionTiles();

        this.bumpPos = new Vector();

        this.sprCoin = new AnimatedSprite(16, 16);

        this.cloudPositions = [0, 80, 160];
    }


    private getTile(layer : number, x : number, y : number, def : number = 0) : number {

        if (layer < 0 || layer >= this.staticTiles.length ||
            x < 0 || y < 0 || x >= this.width || y >= this.height) {

            return def;
        }
        return this.staticTiles[layer][y*this.width + x];
    }


    private computeCollisionTile(x : number, y : number, layer : number) : void {

        const START_INDEX : number = 257;

        const index : number = y*this.width + x;
        for (let colLayer = 0; colLayer < 4; ++ colLayer) {

            const tileID : number = this.getTile(layer, x, y);
            if (tileID <= 0)
                continue;

            for (let i = 0; i < 4; ++ i) {

                const colTileID : number = this.collisionMap.getIndexedTile(colLayer, tileID - 1) - START_INDEX;
                if (colTileID < 0)
                    continue;

                this.collisions[index] |= (1 << colTileID);
            }
        }
    }


    private createCollisionTiles() : void {

        for (let layer = 0; layer < this.staticTiles.length; ++ layer) {

            for (let y = 0; y < this.height; ++ y) {

                for (let x = 0; x < this.width; ++ x) {

                    this.computeCollisionTile(x, y, layer);
                }
            }
        }
    }


    private tileCollision(o : CollisionObject, x : number, y : number, colID : number, event : ProgramEvent) : void {

        const HORIZONTAL_OFFSET : number = 1;
        const VERTICAL_OFFSET : number = 1;
        const COIN_RADIUS : number = 4;
        const SPIKE_WIDTH : number = 8;
        const SPIKE_HEIGHT : number = 4;

        const dx : number = x*TILE_WIDTH;
        const dy : number = y*TILE_HEIGHT;

        const index : number = y*this.width + x;

        // Floor
        if ((colID & CollisionBit.Top) != 0) {

            o.verticalCollision(dx + HORIZONTAL_OFFSET, dy, TILE_WIDTH - HORIZONTAL_OFFSET*2, 1, event);
        }
        // Ceiling
        if ((colID & CollisionBit.Bottom) != 0) {

            o.verticalCollision(dx + HORIZONTAL_OFFSET, dy + TILE_HEIGHT, TILE_WIDTH - HORIZONTAL_OFFSET*2, -1, event);
        }
        // Left
        if ((colID & CollisionBit.Left) != 0) {

            o.horizontalCollision(dx, dy + VERTICAL_OFFSET, TILE_HEIGHT - VERTICAL_OFFSET*2, 1, event);
        }
        // Right
        if ((colID & CollisionBit.Right) != 0) {

            o.horizontalCollision(dx + TILE_WIDTH, dy + VERTICAL_OFFSET, TILE_HEIGHT - VERTICAL_OFFSET*2, -1, event);
        }

        // Spike
        if ((colID & CollisionBit.SpikeBottom) != 0) {

            o.hurtCollision?.(dx + SPIKE_WIDTH/2, dy + TILE_HEIGHT - SPIKE_HEIGHT, SPIKE_WIDTH, SPIKE_HEIGHT, event);
        }

        // Star block
        if ((colID & CollisionBit.StarBlock) != 0) {

            if (o.verticalCollision(dx + HORIZONTAL_OFFSET, dy + TILE_HEIGHT, TILE_WIDTH - HORIZONTAL_OFFSET*2, -1, event)) {

                // Have you ever noticed that in Mario you can never
                // hit two question blocks at once? This is used to emulate
                // that behavior
                o.nudgeDown(0.5, event);

                // "Disable" star block and update collisions
                // To safe space we make an ugly assumption that
                // all the blocks are in bottom layer
                this.staticTiles[0][index] = this.staticTiles[0][index] + 16;
                this.staticTiles[1][index - this.width] = 128;
                this.collisions[index - this.width] = CollisionBit.Coin;
                this.collisions[index] = 0b1111;
 
                this.bumpPos.x = x;
                this.bumpPos.y = y;
                this.bumpTimer = BUMP_TIME;
            }
        }

        // Coin
        if ((colID & CollisionBit.Coin) != 0) {

            if (o.coinCollision?.((x + 0.5)*TILE_WIDTH, (y + 0.5)*TILE_HEIGHT, COIN_RADIUS, event) ?? false) {

                // And here we assume that all the coins are in the top layer
                this.staticTiles[1][index] = 0;
                this.collisions[index] = 0;
            }
        }
    }


    private drawSpecialTile(canvas : Canvas, x : number, y : number, tileID : number) : void {

        const WATER_WAVE_HEIGHT : number = 2.0;

        const waveFunction : (t : number) => number = t => 
            Math.round(Math.sin(this.waterWave + 
                (Math.PI*2)/32*t)*WATER_WAVE_HEIGHT + 
                Math.sin(Math.PI/8*t));

        switch (tileID) {

        // Lava
        case 127: {

            const bmpGameArt : Bitmap = canvas.assets.getBitmap("g");
            for (let dx = 0; dx < 32; ++ dx) {

                canvas.drawBitmap(bmpGameArt, Flip.None, 
                    x*TILE_WIDTH + dx, y*TILE_HEIGHT + WATER_WAVE_HEIGHT + 1 + waveFunction(dx), 
                    56 + (x % 8), 32, 1, 16);
            }
            }
            break;
        

        // Coin
        case 128: {

                const bmpCoin : Bitmap = canvas.assets?.getBitmap("c");
                this.sprCoin.draw(canvas, bmpCoin, x*TILE_WIDTH, y*TILE_HEIGHT);
            }
            break;

        default:
            break;
        }
    }


    public update(event : ProgramEvent) : void {

        const CLOUD_SPEEDS : number[] = [0.3333, 0.6667, 1.3333];
        const WAVE_SPEED : number = Math.PI*2/60.0;

        if (this.bumpTimer > 0) {

            this.bumpTimer -= event.tick;
        }

        this.sprCoin.animate(0, 0, 3, 8, event.tick);

        const cloudWidth : number = (event.assets.getBitmap("c1")?.width) ?? 240;
        for (let i = 0; i < this.cloudPositions.length; ++ i) {

            this.cloudPositions[i] = (this.cloudPositions[i] + CLOUD_SPEEDS[i]*event.tick) % cloudWidth;
        }

        this.waterWave = (this.waterWave + WAVE_SPEED*event.tick) % (Math.PI*2);
    }


    public drawBackground(canvas : Canvas, camera : Camera) : void {

        const CLOUD_BASE_OFFSET_Y : number = 48;
        const CLOUD_LAYER_OFFSET_Y : number = 32;

        // Sky
        canvas.clear(SKY_COLOR);

        // Moon
        const bmpMoon : Bitmap = canvas.assets.getBitmap("m");
        canvas.drawBitmap(bmpMoon, Flip.None, canvas.width - 100, 16);

        // Clouds
        const bmpClouds : Bitmap[] = [1, 2, 3].map(i => canvas.assets?.getBitmap("c" + String(i)));
        const width : number = bmpClouds[0]?.width ?? 256;
        const height : number = bmpClouds[0]?.height ?? 128;

        const repeat : number = (canvas.width/width) + 3;

        for (let j = 0; j < 3; ++ j) {

            const camShiftX : number = -((camera.left/((3 - j)*2)) % width);
            const camShiftY : number = -(camera.top/((3 - j)*2));

            const shiftx : number = -this.cloudPositions[j] + camShiftX;
            const shifty : number = CLOUD_BASE_OFFSET_Y - (2 - j)*CLOUD_LAYER_OFFSET_Y + camShiftY;

            for (let i = -1; i < repeat - 1; ++ i) {

                canvas.drawBitmap(bmpClouds[2 - j], Flip.None, i*width + shiftx, canvas.height - height + shifty);
            }
        }
    }


    public drawLayers(canvas : Canvas, camera : Camera) : void {

        const SPECIAL_TILE_MIN = 112;
        const BUMP_AMPLITUDE : number = 2;
        const CAMERA_MARGIN : number = 1;

        const bmpTileset : Bitmap = canvas.assets?.getBitmap("ts");

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

                    if (tileID >= SPECIAL_TILE_MIN) {

                        this.drawSpecialTile(canvas, x, y, tileID);
                    }

                    const sx : number = (tileID - 1) % 16;
                    const sy : number = ((tileID - 1)/16) | 0;

                    let shifty : number = 0;
                    if (this.bumpTimer > 0 && this.bumpPos.x == x && this.bumpPos.y == y) {

                        shifty = -Math.round(Math.sin(this.bumpTimer/BUMP_TIME*Math.PI)*BUMP_AMPLITUDE);
                    }

                    canvas.drawBitmap(bmpTileset, Flip.None, 
                        x*TILE_WIDTH, y*TILE_HEIGHT + shifty, 
                        sx*TILE_WIDTH, sy*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                }
            }
        }
    }
    

    public objectCollision(o : CollisionObject, event : ProgramEvent) : void {

        const COLLISION_MARGIN : number = 2;
        const LAVA_OFFSET : number = 6;

        if (!o.isActive() || !o.doesTakeCollisions()) {

            return;
        }

        const p : Vector = o.getPosition();

        const startx : number = Math.floor(p.x/TILE_WIDTH) - COLLISION_MARGIN;
        const starty : number = Math.floor(p.y/TILE_HEIGHT) - COLLISION_MARGIN;

        const endx : number = startx + COLLISION_MARGIN*2;
        const endy : number = starty + COLLISION_MARGIN*2;

        for (let x = startx; x <= endx; ++ x) {

            for (let y = starty; y <= endy; ++ y) {

                if (x < 0 || y < 0 || x >= this.width || y >= this.height) {

                    continue;
                }

                const colID : number = this.collisions[y*this.width + x] ?? 0;
                if (colID == 0) {

                    continue;
                }
                this.tileCollision(o, x, y, colID, event);
            }
        }

        // Lava below!
        o.lavaCollision?.((this.height - 1)*TILE_HEIGHT + LAVA_OFFSET, event);
    }
}
