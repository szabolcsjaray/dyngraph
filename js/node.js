const LINKMAXLENGTH = 30;
const LINKMINLENGTH = 20;

class Node {
    constructor( name, shape, size, fillcolour, outlcolour, linecolour, x, y, c2d) {
        this.name = name;
        this.shape = shape;
	this.size = size;
        this.fillcolour = fillcolour;
	this.outlcolour = outlcolour;
        this.linecolour = linecolour;
        this.x = x;
        this.y = y;
        this.links = [];
        this.backLinks = [];
        this.c2d = c2d;
        this.fx = 0;
        this.fy = 0;
    }

    resetForce() {
        this.fx = 0;
        this.fy = 0;
    }

    addForce(otherNode) {
        let dist = Math.sqrt((this.x-otherNode.x)*(this.x-otherNode.x) + (this.y-otherNode.y)*(this.y-otherNode.y));

        if ((this.links.indexOf(otherNode)!=-1) ||
            (this.backLinks.indexOf(otherNode)!=-1)) {
            //console.log('Linked node force:' + this.name + ' - ' + otherNode.name);
            if (dist>LINKMAXLENGTH) {
                this.fx += (otherNode.x-this.x)/dist*(dist-10)/40;
                this.fy += (otherNode.y-this.y)/dist*(dist-10)/40;
            } else if (dist<LINKMINLENGTH) {
                this.fx += (this.x-otherNode.x)/dist*(LINKMINLENGTH-dist)/30;
                this.fy += (this.y-otherNode.y)/dist*(LINKMINLENGTH-dist)/30;
            }
        } else {
            //console.log('Not linked node force:' + this.name + ' - ' + otherNode.name);
            if (dist<100) {
                this.fx += (this.x-otherNode.x)/dist;
                this.fy += (this.y-otherNode.y)/dist;
            }
        }
    }

    step() {
        this.x += this.fx;
        this.y += this.fy;
        this.resetForce();
    }

    addLink(otherNode) {
        this.links.push(otherNode);
        otherNode.addBacklink(this);
    }

    addBacklink(otherNode) {
        this.backLinks.push(otherNode);
    }

    is_connected(other_node) {
	for(let i in this.links)
	    if (this.links[i].name == other_node.name)
		return true;
	for(let i in this.backLinks)
	    if (this.backLinks[i] == other_node.name)
		return true;
	return false;
    }

    draw(setLineColour,setOutLineColour,setFillColour) {
        if (setFillColour)
	    this.c2d.fillStyle = this.fillcolour;
	if (setOutLineColour)
            this.c2d.strokeStyle = this.outlcolour;
        this.c2d.beginPath();
        this.c2d.arc(this.x, this.y, this.size, 0, 2*Math.PI);
	if (setFillColour)
            this.c2d.fill();
	if (setOutLineColour)
	    this.c2d.stroke();

	if (setLineColour)
            this.c2d.strokeStyle = this.linecolour;
        this.c2d.beginPath();
        this.links.forEach(otherNode => {
            this.c2d.moveTo(this.x, this.y);
            this.c2d.lineTo(otherNode.x, otherNode.y);
        });

	if (setLineColour)
            this.c2d.stroke();
    }

    status() {
        return this.name+": coord.: (" + this.x + ","+this.y+") forces: ("+ this.fx + ","+this.fy+")";
    }
}
