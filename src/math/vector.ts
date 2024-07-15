import { Rectangle } from "./rectangle.js";


export class Vector {

    public x : number;
    public y : number;
    public z : number;
    public w : number;


    constructor(x : number = 0.0, y : number = 0.0, z : number = 0, w : number = 0) {
		
		this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
	}

	
	public get length() : number {

		return Math.hypot(this.x, this.y, this.z, this.w);
	}
	
	
	public clone = () : Vector => new Vector(this.x, this.y, this.z, this.w);


	public zeros() : void {

        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
	}


    public overlay(rect : Rectangle) : boolean {

        return this.x >= rect.x && this.x <= rect.x + rect.w &&
               this.y >= rect.y && this.y <= rect.y + rect.h; 
    }


    static normalize(v : Vector, forceUnit : boolean = false) : Vector {
		
		const EPS : number = 0.0001;
		
		const len : number = v.length;
		if (len < EPS) {
			
            v.zeros();
			v.x = forceUnit ? 1 : 0;

			return v;
		}
		
		v.x /= len;
		v.y /= len;
        v.z /= len;
        v.w /= len;

        return v;
	}
}
