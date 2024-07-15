

export class Rectangle {

    public x : number;
    public y : number;
    public w : number;
    public h : number;


    constructor(x : number = 0.0, y : number = 0.0, w : number = 0, h : number = 0) {
		
		this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
	}
	
	
	public clone = () : Rectangle => new Rectangle(this.x, this.y, this.w, this.h);
}