const node_params = {
    link_max_length: 30, // 30
    link_min_length: 20, // 20
    dist_modifier:   10, // 10
    large_dist_div:  40, // 40
    small_dist_div:  30, // 30
    dist_threshold: 100, // 100
    label_offset_x:   0, // 0
    label_offset_y:   0, // 0
    nudge_size:       5, // 5
    fx_multip:        1, // 1
    fy_multip:        1, // 1
    anim_timeout:    10, // 10
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
	this.visited = false;
    }

    visit() { this.visited = true; }
    unvisit() { this.visited = false; }
    
    refresh_colours(cols,rnd) {
        this.fillcolour = rnd.fill_colour ? gen_colour() : cols.fill_colour;
	this.fontcolour = rnd.font_colour ? gen_colour() : cols.font_colour;
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
        this.x += this.fx*node_params.fx_multip;;
        this.y += this.fy*node_params.fy_multip;
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

    connect(otherNode) {
	if(!this.constructor.is_connected(this,otherNode)) {
	    this.add_uni_link(otherNode);
	    otherNode.add_back_link(this);
	}
    }

    disconnect(otherNode) {
	if(this.constructor.is_connected(this,otherNode)) {
	    this.rem_link(otherNode);
	    otherNode.rem_back_link(this);
	    return true;
	}
	return false;
    }
	
    rem_from_arr(arr,node) {
	const ind = arr.indexOf(node);
	if (ind > -1)
	    arr.splice(ind,1);
    }
    
    rem_link(otherNode) {
	this.rem_from_arr(this.links,otherNode);
    }

    rem_back_link(otherNode) {
	this.rem_from_arr(this.backLinks,otherNode);
    }
    
    add_uni_link(otherNode) {
        this.links.push(otherNode);
    }

    add_back_link(otherNode) {
        this.backLinks.push(otherNode);
    }

    static is_connected(n,other_node) {
	for(let i in n.links)
	    if (n.links[i] == other_node)
		return true;
	for(let i in n.backLinks)
	    if (n.backLinks[i] == other_node)
		return true;
	return false;
    }

    static draw(n,p,draw_trace,draw_labels) {
        if (!p.fill_colour)
	    n.c2d.fillStyle = draw_trace ? n.tracefillcolour : n.fillcolour;

	if (!p.line_colour)
            n.c2d.strokeStyle = draw_trace ? n.tracelinecolour : n.linecolour;
        n.c2d.beginPath();
	switch(n.shape) {
	case 'c':
            n.links.forEach(otherNode => {
		const coords1 = this.getPointOnCircle(n,this.angleBetween(n,otherNode));
		n.c2d.moveTo(coords1[0], coords1[1]);
		const coords2 = this.getPointOnCircle(otherNode,this.angleBetween(otherNode,n));
		n.c2d.lineTo(coords2[0], coords2[1]);
            });
	    break;
	case 'e':
	    n.links.forEach(otherNode => {
		const coords1 = this.getPointOnEllipse(n,this.angleBetween(n,otherNode));
		n.c2d.moveTo(coords1[0], coords1[1]);
		const coords2 = this.getPointOnEllipse(otherNode,this.angleBetween(otherNode,n));
		n.c2d.lineTo(coords2[0], coords2[1]);
            });
	    break;
	case 'r':
	case 's':
	    n.links.forEach(otherNode => {
		const coords1 = this.getConnectionPoint(n,otherNode);
		n.c2d.moveTo(coords1[0], coords1[1]);
		const coords2 = this.getConnectionPoint(otherNode,n);
		n.c2d.lineTo(coords2[0], coords2[1]);
            });
	    break;
	default:
	    n.links.forEach(otherNode => {
		n.c2d.moveTo(otherNode.x, otherNode.y);
		n.c2d.lineTo(n.x, n.y);
            });
	}
	if (!p.line_colour)
            n.c2d.stroke();

	if (!p.outline_col)
            n.c2d.strokeStyle = draw_trace ? this.traceoutlcolour : this.outlcolour;
	
	n.c2d.beginPath();
	switch(n.shape) {
	case 'c':
	case 'e':
            n.c2d.ellipse(n.x, n.y, n.size0, n.size1, 0, 0, 2*Math.PI);
	    break;
	case 's':
	case 'r':
	    n.c2d.rect(n.x, n.y, n.size0, n.size1);
	    break;
	}
	if (!p.fill_colour)
            n.c2d.fill();
	if (!p.outline_col)
	    n.c2d.stroke();
	if (draw_labels) {
	    n.c2d.fillStyle=n.fontcolour;
	    n.c2d.fillText(n.name, n.x + node_params.label_offset_x, n.y + node_params.label_offset_y);
	}
    }

    static angleBetween(n,other) {
	// Calculate the angle...
	// This is our "0" or start angle..
	let rotation = -Math.atan2(other.x - n.x, other.y - n.y);
	rotation = rotation + Math.PI; // 180 degrees

	return rotation;
    }
    static getPointOnCircle(n,radians) {
	radians = radians - Math.PI/2; // 0 becomes the top
	// Calculate the outter point of the line
	return [Math.round(n.x + Math.cos(radians) * n.size0),  // pos x
		Math.round(n.y + Math.sin(radians) * n.size0)]; // pos y
    }
    static getPointOnEllipse(n,radians) {
	radians = radians - Math.PI/2; // 0 becomes the top
	// Calculate the outter point of the line
	return [Math.round(n.x + Math.cos(radians) * n.size0),  // pos x
		Math.round(n.y + Math.sin(radians) * n.size1)]; // pos y
    }

    static getConnectionPoint(n,otherNode) {
	// full over
	if (otherNode.y + otherNode.size1 < n.y)
	    return [n.x + n.size0 / 2, n.y];
	// full below
	if (otherNode.y > n.y + n.size1)
	    return [n.x + n.size0 / 2, n.y + n.size1];
	// full left
	if (otherNode.x + otherNode.size0 < n.x)
	    return [Number(n.x), n.y + n.size1 / 2];
	// full right
	if (otherNode.x > n.x + n.size0)
	    return [n.x + n.size0, n.y + n.size1 / 2];

	const x = (otherNode.x < n.x) ? n.x : n.x + n.size0;
	const y = (otherNode.y < n.y) ? n.y : n.y + n.size1;
	return [x,y];
    }

    static status(g) {
        return g.name+": coord.: (" + g.x + ","+g.y+") forces: ("+ g.fx + ","+g.fy+")";
    }
}
