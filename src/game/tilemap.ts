

const unpackLayer = (packedData : number[]) : number[] => {

    let out : number[] = [];
    for (let i = 0; i < packedData.length; i += 2) {

        out = out.concat((new Array<number> (packedData[i + 1])).fill(packedData[i]));
    }
    return out;
}


export class Tilemap {


    private layers : Array<number[]>;
    
    public readonly width : number;
    public readonly height : number;


    public get layerCount() : number {

        return this.layers.length;
    }


    constructor(packedData : {width : number, height : number, layers : number[][]} ) {

        this.width = packedData.width;
        this.height = packedData.height;
        this.layers = new Array<number[]> (packedData.layers.length);

        for (let i = 0; i < packedData.layers.length; ++ i) {

            this.layers[i] = unpackLayer(packedData.layers[i]);
        }

        console.log(this.layers);
    }


    public cloneLayer = (layer : number, cutoff? : number) : number[] | undefined => Array.from(
        this.layers[layer].filter((v : number) => cutoff === undefined ? true : v < cutoff)
    );


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
