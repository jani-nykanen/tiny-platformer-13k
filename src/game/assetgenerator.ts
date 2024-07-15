import { Assets } from "../core/assets.js";
import { applyPalette } from "../gfx/generator.js";
import { Bitmap } from "../gfx/bitmap.js";
import { Canvas } from "../gfx/canvas.js";
import { Flip } from "../gfx/flip.js";


const PALETTE_LOOKUP : string[] = [

    "00000000", // 0 Transparent

    // Black, white and shades of gray
    "000000ff", // 1 Black
    "ffffffff", // 2 White
    "494949ff", // 3 Dark gray
    "6d6d6dff", // 4 Not-so-dark gray,

    // Grass
    "499200ff", // 5 Dark(er) green
    "92db00ff", // 6 Green
    "ffff92ff", // 7 Bright yellow

    // Soil
    "db6d00ff", // 8 Dark soil color
    "ffb66dff", // 9 Bright soil color

];


const GAME_ART_PALETTE_TABLE : string[] = [


    "1065", "1065", "1065", "1065", "1065", "1089", "1089", "1089",
    "0007", "0007", "0007", "1065", "1065", "1089", "1089", "0007",

    "1076", "1056", "1056", "0007", "0007", "1065", "1065", "1089",
    "1056", "1056", "1056", "0007", "0007", "1000", "000A", "1098",

    "1400", "1400", "1200", "1300", "1402", "1403", "1402", "1403", 
    "1400", "1400", "1200", "1300", "1402", "1403", "1402", "1403", 
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


const generateTileset = (assets : Assets) : void => {

    const BRIDGE_YOFF : number = 11;

    const bmpGameArt : Bitmap = assets.getBitmap("g");
    const canvas : Canvas = new Canvas(256, 256, 256, 256, assets, false);

    // TODO: Split to shorter functions...

    // Soil
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

                        const shiftx : number = (x & 1)*8;

                        canvas.drawBitmap(bmpGameArt, Flip.None, 48 + x*8, y*8, 24 + shiftx, 8, 8, 8);
                        canvas.drawBitmap(bmpGameArt, Flip.None, 48 + x*8, y*8, 24 + shiftx, 24, 8, 8);
                        
                    }
                }

                // Top
                if (y == 0) {

                    if (i == 0 || (x > 0 && x < 5)) {

                        const sx : number = x == 0 ? 0 : (x == 5 ? 16 : 8);

                        canvas.drawBitmap(bmpGameArt, Flip.None, i*48 + x*8, y*8, sx, 0, 8, 8);
                        canvas.drawBitmap(bmpGameArt, Flip.None, i*48 + x*8, y*8, sx, 8, 8, 8);
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

        // Bridge
        canvas.drawBitmap(bmpGameArt, Flip.None, 96 + i*8, BRIDGE_YOFF, 56, 16, 8, 16);
        canvas.drawBitmap(bmpGameArt, Flip.None, 96 + i*8, BRIDGE_YOFF + 5, 56, 8, 8, 8);
    }

    assets.addBitmap("ts", canvas.toBitmap());
}


// Hmm, generating assets from assets...
export const generateAssets = (assets : Assets) : void => {

    generateFonts(assets);
    generateGameArt(assets);
    generateTileset(assets);
}
