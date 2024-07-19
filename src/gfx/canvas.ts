import { Assets } from "../core/assets.js";
import { Vector } from "../math/vector.js";
import { Align } from "./align.js";
import { Flip } from "./flip.js";
import { Bitmap } from "./bitmap.js";
import { clamp } from "../math/utility.js";


export class Canvas {


    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    private translation : Vector = new Vector();

    private minWidth : number;
    private maxWidth : number;
    private minHeight : number;
    private maxHeight : number;

    public get width() : number {

        return this.canvas.width;
    }
    public get height() : number {

        return this.canvas.height;
    }

    public readonly assets : Assets | undefined;


    constructor(minWidth : number, minHeight : number, 
        maxWidth : number = minWidth, maxHeight : number = minHeight,
        assets : Assets | undefined = undefined,
        embed : boolean = false) {

        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;

        this.assets = assets;

        this.createCanvas(minWidth, minHeight, embed);
        if (embed) {

            this.resizeEvent(window.innerWidth, window.innerHeight);
            window.addEventListener("resize", () : void => this.resizeEvent(window.innerWidth, window.innerHeight));
        }

        // Hide cursor
        // document.body.style.cursor = "none";
    }


    private createCanvas(width : number, height : number, embed : boolean = true) : void {

        let div : HTMLDivElement | undefined = undefined;
        if (embed) {

            div = document.createElement("div");
            div.id = "d";
            div.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");
        }
        
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("style", 
            "position: absolute;" +
            "z-index: -1;" +
            "image-rendering: optimizeSpeed;" + 
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;");

        this.canvas.width = width;
        this.canvas.height = height;

        if (embed) { 

            div.appendChild(this.canvas);
            document.body.appendChild(div);
        }

        // Typecast used to avoid warning that this can be null. Yes, it can, but
        // we don't have enough room for proper error/type safety checking.
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.globalAlpha = 1.0;
    }


    private resizeEvent(width : number, height : number) : void {

        const targetRatio : number = this.minWidth/this.minHeight;
        const windowRatio : number = width/height;

        let newWidth : number = 0;
        let newHeight : number = 0;

        let multiplier : number = 1.0;

        if (windowRatio >= targetRatio) {

            newWidth = Math.round(windowRatio*this.minHeight);
            newHeight = this.minHeight;

            multiplier = height/this.minHeight;
        }
        else {

            newWidth = this.minWidth;
            newHeight = Math.round(this.minWidth/windowRatio);

            multiplier = width/this.minWidth;
        }

        newWidth = Math.min(newWidth, this.maxWidth) | 0;
        newHeight = Math.min(newHeight, this.maxHeight) | 0;

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        const cornerx : number = (width/2 - multiplier*newWidth/2) | 0;
        const cornery : number  = (height/2 - multiplier*newHeight/2) | 0;

        this.canvas.style.width  = String( (newWidth*multiplier) | 0) + "px";
        this.canvas.style.height = String( (newHeight*multiplier) | 0) + "px";
    
        this.canvas.style.left = String(cornerx) + "px";
        this.canvas.style.top  = String(cornery) + "px";
    }


    public clear(colorStr : string) : void {

        const ctx : CanvasRenderingContext2D = this.ctx;

        ctx.fillStyle = colorStr;
        ctx.fillRect(0, 0, this.width, this.height);
    }


    public setFillColor(colorStr : string = "#ffffff") : void {

        this.ctx.fillStyle = colorStr;
    }


    public setAlpha(alpha : number = 1.0) : void {

        this.ctx.globalAlpha = clamp(alpha, 0.0, 1.0);
    }


    public fillRect(x : number = 0, y : number = 0, 
        w : number = this.width, h : number = this.height) : void {

        x = (x + this.translation.x) | 0;
        y = (y + this.translation.y) | 0;

        this.ctx.fillRect(x, y, w | 0, h | 0);
    }


    public fillCircle(cx : number, cy : number, radius : number) : void {

        cx = (cx + this.translation.x) | 0;
        cy = (cy + this.translation.y) | 0;

        for (let y = -radius; y <= radius; ++ y) {

            const ny : number = y/radius;
            const r : number =  Math.round(Math.sqrt(1 - ny*ny)*radius);

            if (r <= 0) {

                continue;
            }

            this.ctx.fillRect(cx - r, cy + y, r*2, 1);
        }
    }


    public fillCircleOutside(r : number, cx : number = this.width/2, cy : number = this.height/2) : void {

        cx = (cx + this.translation.x) | 0;
        cy = (cy + this.translation.y) | 0;

        const start : number = Math.max(0, cy - r) | 0;
        const end : number = Math.min(this.height, cy + r) | 0;

        if (start > 0) {

            this.fillRect(0, 0, this.width, start);
        }
        if (end < this.height) {

            this.fillRect(0, end, this.width, this.height - end);
        }

        for (let y = start; y < end; ++ y) {

            const dy : number = y - cy;
            if (Math.abs(dy) >= r) {

                this.ctx.fillRect(0, y, this.width, 1);
                continue;
            }

            const px1 : number = Math.round(cx - Math.sqrt(r*r - dy*dy));
            const px2 : number = Math.round(cx + Math.sqrt(r*r - dy*dy));

            if (px1 > 0) {

                this.ctx.fillRect(0, y, px1, 1);
            }
            if (px2 < this.width) {

                this.ctx.fillRect(px2, y, this.width - px1, 1);
            }
        }
    }


    public drawBitmap(bmp : Bitmap, flip : Flip = Flip.None,
        dx : number = 0, dy : number = 0,
        sx : number = 0, sy : number = 0,
        sw : number = bmp?.width ?? 1, sh : number = bmp?.height ?? 1,
        dw : number = sw, dh : number = sh,
        centerx : number = sw/2, centery : number = sh/2,
        rotation : number | undefined = undefined) : void {

        if (bmp === undefined) {

            return;
        }

        dx = (dx + this.translation.x) | 0;
        dy = (dy + this.translation.y) | 0;
        
        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;
        dx |= 0;
        dy |= 0;

        const ctx : CanvasRenderingContext2D = this.ctx;

        const transform : boolean = flip != Flip.None || rotation !== undefined;

        if (transform) {

            ctx.save();
        }

        if ((flip & Flip.Horizontal) != 0) {

            ctx.translate(sw, 0);
            ctx.scale(-1, 1);
            dx *= -1;
        }
        if ((flip & Flip.Vertical) != 0) {

            ctx.translate(0, sh);
            ctx.scale(1, -1);
            dy *= -1;
        }
        
        // TODO: Check if the order is correct, might not play
        // nicely with flipping
        if (rotation !== undefined) {

            ctx.translate((centerx + dx) | 0, (centery + dy) | 0);
            ctx.rotate(-rotation + Math.PI/2);
            
            dx = -centerx;
            dy = -centery;
        }

        ctx.drawImage(bmp, sx, sy, sw, sh, dx, dy, dw, dh);

        if (transform) {

            ctx.restore();
        }
    }


    public drawText(font : Bitmap, text : string, 
        dx : number, dy : number, xoff : number = 0, yoff : number = 0, 
        align : Align = Align.Left, scalex : number = 1.0, scaley : number = 1.0) : void {

        if (font === undefined)
            return;

        const cw : number = (font.width/16) | 0;
        const ch : number = cw;

        dx = (dx + this.translation.x) | 0;
        dy = (dy + this.translation.y) | 0;

        let x : number = dx;
        let y : number = dy;

        if (align == Align.Center) {

            dx -= ((text.length)*(cw + xoff)*scalex/2.0) | 0;
            x = dx;
        }
        else if (align == Align.Right) {
            
            dx -= (((text.length + 1)*(cw + xoff))*scalex) | 0;
            x = dx;
        }

        for (let i = 0; i < text.length; ++ i) {

            const chr : number = text.charCodeAt(i);
            // Note: we assume that we encounter only Unix-type
            // newlines. Carriage returns (\r) are attempted to draw normally,
            // whatever the result might be.
            if (chr == '\n'.charCodeAt(0)) {

                x = dx;
                y += (ch + yoff) * scaley;
                continue;
            }

            this.drawBitmap(font, Flip.None, 
                x, y, (chr % 16)*cw, ((chr/16) | 0)*ch, 
                cw, ch, cw*scalex, ch*scaley);

            x += (cw + xoff)*scalex;
        }
    }


    public move(dx : number, dy : number = 0.0) : void {

        this.translation.x += dx;
        this.translation.y += dy;
    }


    public moveTo(dx : number = 0.0, dy : number = 0.0) : void {

        this.translation.x = dx;
        this.translation.y = dy;
    }


    // A bit of cheating here
    public toBitmap = () : Bitmap => this.canvas;
}
