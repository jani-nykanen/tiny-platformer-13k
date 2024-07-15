import { Assets } from "../core/assets.js";
import { applyPalette } from "../gfx/generator.js";
import { Bitmap } from "../gfx/bitmap.js";


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

    "1076", "1056", "1056", "0007", "0007", "1000", "000A", "1089",
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


const generateIcons = (assets : Assets) : void => {

    const bmpIconsRaw : Bitmap = assets.getBitmap("_i");

    const bmpIcons : Bitmap = applyPalette(bmpIconsRaw, 
        (new Array<string>(16*8)).fill("1002"),
        PALETTE_LOOKUP);

    assets.addBitmap("i", bmpIcons);
}


const generateGameArt = (assets : Assets) : void => {

    const bmpGameArtRaw : Bitmap = assets.getBitmap("_g");

    const bmpGameArt : Bitmap = applyPalette(bmpGameArtRaw,
        GAME_ART_PALETTE_TABLE, PALETTE_LOOKUP);

    assets.addBitmap("g", bmpGameArt);
}


// Hmm, generating assets from assets...
export const generateAssets = (assets : Assets) : void => {

    generateFonts(assets);
    generateIcons(assets);
    generateGameArt(assets);
}
