const node_params = {
    link_max_length: 30,
    link_min_length: 20,
    dist_modifier:   10,
    large_dist_div:  40,
    small_dist_div:  30,
    dist_threshold: 100,
};

function modify_params(param,value) {
    //console.log("param: " + param + ", value: " + value);
    if (Object.keys(node_params).indexOf(param) != -1) {
	node_params[param] = value;
    } else
	console.log("Invalid node_param has been received: " + param);
}

class Node {
    constructor( name, shape, size, cols, rnd, x, y, c2d) {
        this.name = name;
        this.shape = shape;
	this.size = size;
        this.fillcolour = rnd.rnd_fil_col ? gen_colour() : cols.fill_colour;
	this.outlcolour = rnd.rnd_oli_col ? gen_colour() : cols.outline_col;
        this.linecolour = rnd.rnd_lin_col ? gen_colour() : cols.line_colour;
	this.tracefillcolour = rnd.rnd_trc_fil ? gen_colour() : cols.trc_fil_col;
	this.traceoutlcolour = rnd.rnd_trc_oli ? gen_colour() : cols.trc_oli_col;
	this.tracelinecolour = rnd.rnd_trc_lin ? gen_colour() : cols.trc_lin_col;
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
            if (dist>node_params.link_max_length) {
                this.fx += (otherNode.x-this.x)/dist*(dist-node_params.dist_modifier)/node_params.large_dist_div;
                this.fy += (otherNode.y-this.y)/dist*(dist-node_params.dist_modifier)/node_params.large_dist_div;
            } else if (dist<node_params.link_min_length) {
                this.fx += (this.x-otherNode.x)/dist*(node_params.link_min_length-dist)/node_params.small_dist_div;
                this.fy += (this.y-otherNode.y)/dist*(node_params.link_min_length-dist)/node_params.small_dist_div;
            }
        } else {
            //console.log('Not linked node force:' + this.name + ' - ' + otherNode.name);
            if (dist<node_params.dist_threshold) {
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

    draw(p,draw_trace) {
        if (p.fill)
	    this.c2d.fillStyle = draw_trace ? this.tracefillcolour : this.fillcolour;
	if (p.outl)
            this.c2d.strokeStyle = draw_trace ? this.traceoutlcolour : this.outlcolour;

	if (p.line)
            this.c2d.strokeStyle = draw_trace ? this.tracelinecolour : this.linecolour;
        this.c2d.beginPath();
        this.links.forEach(otherNode => {
            this.c2d.moveTo(this.x, this.y);
            this.c2d.lineTo(otherNode.x, otherNode.y);
        });
	if (p.line)
            this.c2d.stroke();

	this.c2d.beginPath();
        this.c2d.arc(this.x, this.y, this.size, 0, 2*Math.PI);
	if (p.fill)
            this.c2d.fill();
	if (p.outl)
	    this.c2d.stroke();

    }

    status() {
        return this.name+": coord.: (" + this.x + ","+this.y+") forces: ("+ this.fx + ","+this.fy+")";
    }
}
