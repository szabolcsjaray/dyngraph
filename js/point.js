class Point {
    constructor(x,y) {
	this.x = x;
	this.y = y;
    }
    get_distance(other) {
	return(Math.sqrt((this.x-other.x)*(this.x-other.x) + (this.y-other.y)*(this.y-other.y)));
    }
}
