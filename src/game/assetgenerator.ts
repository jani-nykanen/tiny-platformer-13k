import { Assets } from "../core/assets.js";
import { applyPalette } from "../gfx/generator.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Canvas } from "../gfx/canvas.js";
import { Flip } from "../gfx/flip.js";


// TODO: Do people say "light" or "bright" when
// talking about non-darker shades...?
const PALETTE_LOOKUP : string[] = [

    "00000000", // 0 Transparent

    // Black, white and shades of gray
    "000000ff", // 1 Black
    "ffffffff", // 2 White
    "6d6d6dff", // 3 Dark gray
    "b6b6b6ff", // 4 Light gray,

    // Grass
    "499200ff", // 5 Dark(er) green
    "92db00ff", // 6 Green
    "ffff92ff", // 7 Light yellow

    // Soil
    "db6d00ff", // 8 Dark soil color
    "ffb66dff", // 9 Light soil color
    "db9249ff", // A Alt. Light soil

    // Blue boxes
    "2449b6ff", // B Dark blue
    "4992ffff", // C Blue
    "92dbffff", // D Light blue

    // Star block
    "ffdb92ff", // E Very light brownish
    "924900ff", // F Darker brown

    // Mushroom
    "b62400ff", // G Dark, orange-ish red
    "ff4900ff", // H Orange
    "ff9200ff", // I Brighter orange

    // Player
    "b6b6ffff", // J Purplish whatsoever

    // Coin
    "ffdb00ff", // K Yellow
];


const GAME_ART_PALETTE_TABLE : string[] = [

    "1068", "1068", "1068", "1068", "1068", "10A9", "10A9", "1089",
    "8057", "8057", "8057", "1068", "1068", "10A9", "10A9", "0007",

    "1032", "1031", "1032", "0057", "0057", "1068", "1068", "1089",
    "1032", "1031", "B002", "8057", "8057", "7095", "7005", "1098",

    "10BD", "10BD", "0002", "10FE", "10FE", "1007", "1007", "1403", 
    "10BD", "10BD", "1043", "10FE", "10FE", "1007", "1007", "1403", 

    "10HG", "10HG", "10HG", "10HG", "000I", "1IE2", "1IE2", "10HG",
    "10HG", "10HG", "10HG", "10HG", "10E2", "10E2", "10E2", "000I",

    "10J2", "10J2", "10J2", "10J2", "10J2", "10J2", "10J2", "10J2",
    "10J2", "10J2", "10J2", "10J2", "10J2", "10J2", "10J2", "10J2",

    "10J2", "10J2", "1089", "0000", "107K", "10IK", "10IK", "10IK",
    "10J2", "10J2", "1042", "1042", "10IK", "10IK", "10IK", "10IK"
];


const generateFonts = (assets : Assets) : void => {

    const bmpFontRaw : Bitmap = assets.getBitmap("_f");

    const fontBlack = applyPalette(bmpFontRaw, 
        (new Array<string>(16*8)).fill("0001"), 
        PALETTE_LOOKUP);
    const fontWhite = applyPalette(bmpFontRaw, 
        (new Array<string>(16*8)).fill("0002"), 
        PALETTE_LOOKUP);

    assets.addBitmap("fb", fontBlack);
    assets.addBitmap("fw", fontWhite);
}


const generateGameArt = (assets : Assets) : void => {

    const bmpGameArtRaw : Bitmap = assets.getBitmap("_g");

    const bmpGameArt : Bitmap = applyPalette(bmpGameArtRaw,
        GAME_ART_PALETTE_TABLE, PALETTE_LOOKUP);

    assets.addBitmap("g", bmpGameArt);
}


const generateSoilTilesAndBridge = (canvas : Canvas, bmpGameArt : Bitmap) : void => {

    // Soil
    // (What a beautiful nested for loop!)
    for (let i = 0; i < 2; ++ i) {

        for (let y = 0; y < 4; ++ y) {

            for (let x = 0; x < 6; ++ x) {

                // Base soil
                if (y % 2 == 0 && x % 2 == 0) {

                    const left : number = x == 0 ? 2 : 0;
                    const right : number = x == 4 ? 2 : 0;

                    canvas.drawBitmap(bmpGameArt, Flip.None, i*48 + x*8 + left, y*8, 40, 0, 16 - left - right, 16);
                }

                // Edges
                if (x == 0 || x == 5) {

                    if (i == 0) {

                        const yoff : number = y == 0 ? 1 : 0;
                        if (x == 0) {
                            
                            canvas.drawBitmap(bmpGameArt, Flip.None, x*8, y*8 + yoff, 56, 0, 4, 8 - yoff);
                        }

                        if (x == 5) {

                            canvas.drawBitmap(bmpGameArt, Flip.None, x*8 + 4, y*8 + yoff, 60, 0, 4, 8 - yoff);
                        }
                    }
                    else if (y > 0) {

                        const shiftx : number = x & 1;

                        canvas.drawBitmap(bmpGameArt, Flip.None, 48 + x*8, y*8, 24 + shiftx*8, 8, 8, 8);
                        canvas.drawBitmap(bmpGameArt, Flip.None, 48 + x*8 + (1 - 2*shiftx), y*8, 24 + shiftx*8, 24, 8, 8);
                        
                    }
                }

                // Top
                if (y == 0) {

                    if (i == 0 || (x > 0 && x < 5)) {

                        const sx : number = x == 0 ? 0 : (x == 5 ? 16 : 8);

                        canvas.drawBitmap(bmpGameArt, Flip.None, i*48 + x*8, y*8, sx, 0, 8, 8);
                        canvas.drawBitmap(bmpGameArt, Flip.None, i*48 + x*8, y*8 + 1, sx, 8, 8, 8);
                    }
                    else {

                        const sx : number = x == 0 ? 24 : 32;

                        canvas.drawBitmap(bmpGameArt, Flip.None, i*48 + x*8, y*8, sx, 0, 8, 8);
                        canvas.drawBitmap(bmpGameArt, Flip.None, i*48 + x*8, y*8, sx, 16, 8, 8);
                    }
                }
            }
        }   

        // Corner pieces
        canvas.drawBitmap(bmpGameArt, Flip.None, i*16, 32, 40, 0, 16, 16);
        canvas.drawBitmap(bmpGameArt, Flip.None, i*24, 32, 40 + i*8, 16, 8, 8);
        canvas.drawBitmap(bmpGameArt, Flip.None, i*24, 32, 40 + i*8, 24, 8, 8); 
    }
}


const generateBlocks = (canvas : Canvas, bmpGameArt : Bitmap) : void => {

    // Small clay block
    canvas.setFillColor("#" + PALETTE_LOOKUP[4]);
    canvas.fillRect(33, 33, 14, 14);
    canvas.drawBitmap(bmpGameArt, Flip.None, 32, 32, 0, 16, 16, 16);

    //
    // Big clay block & blue container
    //

    // "Body"
    canvas.fillRect(49, 33, 30, 30);
    canvas.setFillColor("#" + PALETTE_LOOKUP[12]);
    canvas.fillRect(1, 49, 46, 46);

    // Edges
    for (let i = 0; i < 4; ++ i) {

        // Gray block horizontal
        canvas.drawBitmap(bmpGameArt, Flip.None, 54 + i*6, 32, 5, 16, 6, 4);
        canvas.drawBitmap(bmpGameArt, Flip.None, 54 + i*6, 60, 5, 28, 6, 4);

        // Gray block vertical
        canvas.drawBitmap(bmpGameArt, Flip.None, 48, 38 + i*6, 0, 21, 4, 6);
        canvas.drawBitmap(bmpGameArt, Flip.None, 76, 38 + i*6, 12, 21, 4, 6);

        // Blue box horizontal
        canvas.drawBitmap(bmpGameArt, Flip.None, 0, 56 + i*8, 0, 36, 8, 8);
        canvas.drawBitmap(bmpGameArt, Flip.None, 40, 56 + i*8, 8, 36, 8, 8);

        // Blue box vertical
        canvas.drawBitmap(bmpGameArt, Flip.None, 8 + i*8, 48, 4, 32, 8, 8);
        canvas.drawBitmap(bmpGameArt, Flip.None, 8 + i*8, 88, 4, 40, 8, 8);
    }

    // Corners
    for (let x = 0; x < 2; ++ x) {

        for (let y = 0; y < 2; ++ y) {

            // Gray block
            canvas.drawBitmap(bmpGameArt, Flip.None, 48 + x*26, 32 + y*26, x*10, 16 + y*10, 6, 6);

            // Blue block corners
            canvas.drawBitmap(bmpGameArt, Flip.None, x*40, 48 + y*40, x*8, 32 + y*8, 8, 8);
            // ...and screws
            canvas.drawBitmap(bmpGameArt, Flip.None, 2 + x*36, 50 + y*37, 16, 24, 8, 8);

            // Star block bodies
            canvas.setFillColor("#" + PALETTE_LOOKUP[10]);
            canvas.fillRect(48 + x*16 + 1, 64 + y*16 + 1, 14 + x, 14);
            canvas.drawBitmap(bmpGameArt, Flip.None, 48 + x*16, 64 + y*16, 24, 32, 16 - x*3, 16);
            if (x == 1) {
                
                canvas.drawBitmap(bmpGameArt, Flip.None, 48 + x*16 + 11, 64 + y*16, 34, 32, 5, 16);
            }

            // Faces in star blocks
            const yshift : number = y*10;
            const h : number = y*6 + (1 - y)*10; 
            canvas.drawBitmap(bmpGameArt, Flip.None, 48 + x*16, 64 + y*16 + 3, 40, 32 + yshift, 16, h);
        }

        // Eyes
        canvas.drawBitmap(bmpGameArt, Flip.None, 55 + x*10, 43, 16, 16, 8, 8);
    }
}


const generateMushrooms = (canvas : Canvas, bmpGameArt : Bitmap) : void => {

    const RING_OFFSET : number = 2;

    // Leg
    canvas.drawBitmap(bmpGameArt, Flip.None, 128, 12, 40, 48, 16, 8);
    for (let i = 0; i < 8; ++ i) {

        canvas.drawBitmap(bmpGameArt, Flip.None, 128, 16 + i*4, 40, 52, 16, 4);
    }

    // No idea what this is called. Skirt? Ring?
    canvas.drawBitmap(bmpGameArt, Flip.None, 124, 16 + RING_OFFSET, 32, 56, 24, 8);
    canvas.drawBitmap(bmpGameArt, Flip.None, 138, 16 + RING_OFFSET, 56, 56, 8, 8);

    // Base hat
    canvas.drawBitmap(bmpGameArt, Flip.None, 112, 0, 0, 48, 16, 16);
    canvas.drawBitmap(bmpGameArt, Flip.None, 128, 0, 8, 48, 16, 16);
    canvas.drawBitmap(bmpGameArt, Flip.None, 144, 0, 16, 48, 16, 16);

    // Hat shading
    canvas.drawBitmap(bmpGameArt, Flip.None, 113, 1, 32, 48, 8, 8);
    canvas.setFillColor("#" + PALETTE_LOOKUP[18]);
    canvas.fillRect(120, 1, 35, 1);
}


const generateMisc = (canvas : Canvas, bmpGameArt : Bitmap) : void => {

    const BRIDGE_YOFF : number = 13;

    canvas.setFillColor("#000000");

    for (let i = 0; i < 2; ++ i) {

        // Bridge
        canvas.drawBitmap(bmpGameArt, Flip.None, 96 + i*8, BRIDGE_YOFF, 56, 16, 8, 16);
        canvas.drawBitmap(bmpGameArt, Flip.None, 96 + i*8, BRIDGE_YOFF + 5, 56, 8, 8, 8);

        // Spikes
        canvas.drawBitmap(bmpGameArt, Flip.None, 80 + i*8, 40, 16, 40, 8, 8);
        canvas.drawBitmap(bmpGameArt, Flip.None, 80 + i*8, 40, 16, 32, 8, 8);

        // Spike tops & sides
        canvas.fillRect(84 + i*8, 39, 1, 1);
        canvas.fillRect(96, 46, 1, 2);
    }
}


const generateTileset = (assets : Assets) : void => {

    const bmpGameArt : Bitmap = assets.getBitmap("g");
    const canvas : Canvas = new Canvas(256, 256);

    generateSoilTilesAndBridge(canvas, bmpGameArt);
    generateBlocks(canvas, bmpGameArt);
    generateMushrooms(canvas, bmpGameArt);
    generateMisc(canvas, bmpGameArt);

    assets.addBitmap("ts", canvas.toBitmap());
    
}


const generatePlayer = (assets : Assets, bmpGameArt : Bitmap) : Bitmap => { 

    const LEG_SX : number[] = [0, 16, 32, 48, 32, 16, 32, 0];
    const LEG_SY : number[] = [72, 64, 64, 64, 64, 72, 72, 88];

    const canvas : Canvas = new Canvas(160, 32);

    for (let i = 0; i < LEG_SX.length; ++ i) {

        if (i < 6) {
            // Heads
            canvas.drawBitmap(bmpGameArt, Flip.None, i*16, 0, 0, 64, 16, 8);
        }
        // Legs
        canvas.drawBitmap(bmpGameArt, Flip.None, i*16, 8, LEG_SX[i], LEG_SY[i], 16, 8);
    }

    // Special heads (takes less space than adding a lookup table for head (or not...?))
    canvas.drawBitmap(bmpGameArt, Flip.None, 6*16, 0, 48, 72, 16, 8);
    canvas.drawBitmap(bmpGameArt, Flip.None, 7*16, 0, 0, 80, 16, 8);

    // Sword
    for (let i = 0; i < 2; ++ i) {

        canvas.drawBitmap(bmpGameArt, Flip.None, 8*16 + i*2, 0, 16, 80 + i*8, 8 + i*8, 8);
    }

    return canvas.toBitmap();
}


const generateCoin = (assets : Assets, bmpGameArt : Bitmap) : Bitmap => {

    const canvas : Canvas = new Canvas(64, 16);

    canvas.drawBitmap(bmpGameArt, Flip.None, 0, 0, 32, 80, 16, 16);
    canvas.drawBitmap(bmpGameArt, Flip.None, 19, 0, 48, 80, 10, 16);
    canvas.drawBitmap(bmpGameArt, Flip.None, 37, 0, 58, 80, 6, 16);
    canvas.drawBitmap(bmpGameArt, Flip.Horizontal, 51, 0, 48, 80, 10, 16);

    return canvas.toBitmap();
}


const generateSprites = (assets : Assets) : void => {

    const bmpGameArt : Bitmap = assets.getBitmap("g");

    assets.addBitmap("p", generatePlayer(assets, bmpGameArt));
    assets.addBitmap("c", generateCoin(assets, bmpGameArt));
}


const generateCloudLayer = (color : string, width : number, height : number, 
    amplitude : number, period : number, sineFactor : number) : Bitmap => {

    const canvas : Canvas = new Canvas(width, height);

    canvas.setFillColor(color);
    for (let x = 0; x < width; ++ x) {

        const t : number = ((x % period) - period/2)/(period/2 + 2);
        const s : number = x/width*Math.PI*2;
        const dy = 1 + (1.0 - Math.sqrt(1.0 - t*t) + (1.0 + Math.sin(s))*sineFactor)*amplitude;

        canvas.fillRect(x, dy, 1, height - dy + 1);
    }

    return canvas.toBitmap();
}


const generateClouds = (assets : Assets) : void => {

    const AMPLITUDE : number = 16;
    const PERIOD : number = 24;
    const WIDTH : number = 240;
    const HEIGHT : number = 96;
    const SINE_FACTOR : number = 1.5;

    const COLORS : string[] = ["#dbffff", "#92dbff", "#4992db"];

    for (let i = 0; i < COLORS.length; ++ i) {

        assets.addBitmap("c" + String(i + 1), 
            generateCloudLayer(COLORS[i], WIDTH, HEIGHT, AMPLITUDE, PERIOD, SINE_FACTOR));
    }
}


const generateMoon = (assets : Assets) : void => {

    const WIDTH : number = 64;
    const HEIGHT : number = 64;

    const canvas : Canvas = new Canvas(WIDTH, HEIGHT);

    canvas.setFillColor("#ffb649");
    canvas.fillCircle(WIDTH/2, HEIGHT/2, WIDTH/2 - 2);

    canvas.setFillColor("#ffffb6");
    canvas.fillCircle(WIDTH/2 - 2, HEIGHT/2 - 2, WIDTH/2 - 2 - 2);

    assets.addBitmap("m", canvas.toBitmap());
}


// Hmm, generating assets from assets...
export const generateAssets = (assets : Assets) : void => {

    generateFonts(assets);
    generateGameArt(assets);
    generateTileset(assets);
    generateSprites(assets);
    generateClouds(assets);
    generateMoon(assets);
}
