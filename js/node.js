const node_params = {
    link_max_length: 30, // 30
    link_min_length: 20, // 20
    dist_modifier:   10, // 10
    large_dist_div:  40, // 40
    small_dist_div:  30, // 30
    dist_threshold: 100, // 100
    nudge_size: 5,
};

function modify_params(param,value) {
    //console.log("param: " + param + ", value: " + value);
    if (Object.keys(node_params).indexOf(param) != -1) {
	node_params[param] = value;
    } else
	console.log("Invalid node_param has been received: " + param);
}

function rad_to_deg(rad) {
    return(rad * (180 / Math.PI));
}

class Node {
    constructor( name, shape, size0, size1, cols, rnd, x, y, c2d) {
        this.name = name;
        this.shape = shape;
	this.size0 = Number(size0);
	this.size1 = (shape == 'c' || shape == 's') ? Number(size0) : Number(size1);
	this.refresh_colours(cols,rnd);
        this.x = x;
        this.y = y;
        this.links = [];
        this.backLinks = [];
        this.c2d = c2d;
        this.fx = 0;
        this.fy = 0;
    }

    refresh_colours(cols,rnd) {
        this.fillcolour = rnd.fill_colour ? gen_colour() : cols.fill_colour;
	this.outlcolour = rnd.outline_col ? gen_colour() : cols.outline_col;
        this.linecolour = rnd.line_colour ? gen_colour() : cols.line_colour;
	this.tracefillcolour = rnd.trc_fil_col ? gen_colour() : cols.trc_fil_col;
	this.traceoutlcolour = rnd.trc_oli_col ? gen_colour() : cols.trc_oli_col;
	this.tracelinecolour = rnd.trc_lin_col ? gen_colour() : cols.trc_lin_col;
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

    move_up() {
	this.y -= node_params.nudge_size;
    }

    move_down() {
	this.y += node_params.nudge_size;
    }

    move_left() {
	this.x -= node_params.nudge_size;
    }

    move_right() {
	this.x += node_params.nudge_size;
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

    draw(p,draw_trace,draw_labels) {
        if (!p.fill_colour)
	    this.c2d.fillStyle = draw_trace ? this.tracefillcolour : this.fillcolour;

	if (!p.line_colour)
            this.c2d.strokeStyle = draw_trace ? this.tracelinecolour : this.linecolour;
        this.c2d.beginPath();
	switch(this.shape) {
	case 'c':
            this.links.forEach(otherNode => {
		const coords1 = this.getPointOnCircle(this.angleBetween(otherNode));
		this.c2d.moveTo(coords1[0], coords1[1]);
		const coords2 = otherNode.getPointOnCircle(otherNode.angleBetween(this));
		this.c2d.lineTo(coords2[0], coords2[1]);
            });
	    break;
	case 'e':
	    this.links.forEach(otherNode => {
		const coords1 = this.getPointOnEllipse(this.angleBetween(otherNode));
		this.c2d.moveTo(coords1[0], coords1[1]);
		const coords2 = otherNode.getPointOnEllipse(otherNode.angleBetween(this));
		this.c2d.lineTo(coords2[0], coords2[1]);
            });
	    break;
	case 'r':
	case 's':
	    this.links.forEach(otherNode => {
		const coords1 = this.getConnectionPoint(otherNode);
		this.c2d.moveTo(coords1[0], coords1[1]);
		const coords2 = otherNode.getConnectionPoint(this);
		this.c2d.lineTo(coords2[0], coords2[1]);
            });
	    break;
	default:
	    this.links.forEach(otherNode => {
		this.c2d.moveTo(otherNode.x, otherNode.y);
		this.c2d.lineTo(this.x, this.y);
            });
	}
	if (!p.line_colour)
            this.c2d.stroke();

	if (!p.outline_col)
            this.c2d.strokeStyle = draw_trace ? this.traceoutlcolour : this.outlcolour;
	
	this.c2d.beginPath();
	switch(this.shape) {
	case 'c':
	case 'e':
            this.c2d.ellipse(this.x, this.y, this.size0, this.size1, 0, 0, 2*Math.PI);
	    break;
	case 's':
	case 'r':
	    this.c2d.rect(this.x, this.y, this.size0, this.size1);
	    break;
	}
	if (!p.fill_colour)
            this.c2d.fill();
	if (!p.outline_col)
	    this.c2d.stroke();
	if (draw_labels) {
	    c2d.fillText(this.name, this.x, this.y);
	}
    }

    angleBetween(other) {
	// Calculate the angle...
	// This is our "0" or start angle..
	let rotation = -Math.atan2(other.x - this.x, other.y - this.y);
	rotation = rotation + Math.PI; // 180 degrees

	return rotation;
    }
    getPointOnCircle(radians) {
	radians = radians - Math.PI/2; // 0 becomes the top
	// Calculate the outter point of the line
	return [Math.round(this.x + Math.cos(radians) * this.size0),  // pos x
		Math.round(this.y + Math.sin(radians) * this.size0)]; // pos y
    }
    getPointOnEllipse(radians) {
	radians = radians - Math.PI/2; // 0 becomes the top
	//const multipx = this.size0 >= this.size1 ? this.size0 : this.size1;
	//const multipy = this.size1 >= this.size0 ? this.size1 : this.size0;
	// Calculate the outter point of the line
	return [Math.round(this.x + Math.cos(radians) * this.size0),  // pos x
		Math.round(this.y + Math.sin(radians) * this.size1)]; // pos y
    }

    getConnectionPoint(otherNode) {
	// full over
	if (otherNode.y + otherNode.size1 < this.y)
	    return [this.x + this.size0 / 2, this.y];
	// full below
	if (otherNode.y > this.y + this.size1)
	    return [this.x + this.size0 / 2, this.y + this.size1];
	// full left
	if (otherNode.x + otherNode.size0 < this.x)
	    return [Number(this.x), this.y + this.size1 / 2];
	// full right
	if (otherNode.x > this.x + this.size0)
	    return [this.x + this.size0, this.y + this.size1 / 2];

	const x = (otherNode.x < this.x) ? this.x : this.x + this.size0;
	const y = (otherNode.y < this.y) ? this.y : this.y + this.size1;
	return [x,y];
    }

    status() {
        return this.name+": coord.: (" + this.x + ","+this.y+") forces: ("+ this.fx + ","+this.fy+")";
    }
}
