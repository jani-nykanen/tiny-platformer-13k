

export class Tilemap {


    private layers : Map<string, number[]>;
    
    public readonly width : number;
    public readonly height : number;


    constructor(width : number, height : number) {

        this.width = width;
        this.height = height;
        this.layers = new Map<string, number[]> ();
    }


    public cloneLayer = (layer : string) : number[] | undefined => Array.from(this.layers[layer]);


    public getTile(layerName : string, x : number, y : number, def : number = 0) : number {

        const layer : number[] | undefined = this.layers[layerName];
        if (layer === undefined) {

            return def;
        }

        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {

            return def;
        }
        return layer[y*this.width + x];
    }
}
