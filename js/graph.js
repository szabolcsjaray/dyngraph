class Graph {
    constructor(name) {
        this.name = name;
	this.nu_vertices = 0;
	this.nu_edges = 0;
	this.counter = 0;
        this.ns = {};
	this.sn = {};
	this.adj = {};
	this.path = [];
	this.path_col = "#ff00ff";
    }
    add_vertex(node) {
        this.ns[this.counter] = node;
	this.sn[node.name] = this.counter;
	this.adj[this.counter] = [];
	++this.counter;
	++this.nu_vertices;
        return this.ns.length-1;
    }
    rem_vertex_by_name(name) {
	if(this.sn[name]===undefined)
	    return false;
	return this.rem_vertex(this.sn[name]);
    }
    rem_vertex(ind) {
	if(!Object.keys(this.ns).includes(ind.toString()))
	    return false;
	//console.log(`vertex ind to remove: ${this.sn[this.ns[ind].name]}`);
	delete this.sn[this.ns[ind].name];
	//console.log(`vertex to remove: ${this.ns[ind]}`);
	delete this.ns[ind];
	//console.log(`adj to remove: ${this.adj[ind]}`);
	this.rem_edges(ind);
	delete this.adj[ind];
	--this.nu_vertices;
	return true;
    }
    rem_edges(ind) {
	for(let i = this.adj[ind].length - 1; i > -1; --i)
	    this.rem_edge(ind,this.adj[ind][i]);
    }
    add_edge(v1,v2) {
	if(v1 == v2)
	    return false;
	if(this.is_connected(v1,v2))
	    return false;
	this.add_uni_edge(v1,v2);
	this.add_uni_edge(v2,v1);
	return true;
    }
    rem_edge(v1,v2) {
	if(!this.is_connected(v1,v2))
	    return false;
	this.rem_uni_edge(v1,v2);
	if (v1 != v2)
	    this.rem_uni_edge(v2,v1);
	return true;
    }
    add_uni_edge(v1,v2) {
	this.adj[v1].push(v2);
	++this.nu_edges;
    }
    rem_uni_edge(v1,v2) {
	this.adj[v1].splice(this.adj[v1].indexOf(v2),1);
	--this.nu_edges;
    }
    reposition_node(key,xpos,ypos) {
	this.ns[key].x = xpos;
	this.ns[key].y = ypos;
    }
    is_connected(index1,index2) {
	//console.log(`is connected? ${index1} and ${index2}`);
	return(this.adj[index1].includes(index2) || this.adj[index2].includes(index1));
    }
    draw_path() {
	for(let i = 1; i < this.path.length; ++i) {
	    let n0 = this.ns[this.path[i-1]];
	    let n1 = this.ns[this.path[i]];
	    n0.c2d.beginPath();
	    n0.c2d.strokeStyle = this.path_col;
	    n0.c2d.moveTo(n0.x,n0.y);
	    n0.c2d.lineTo(n1.x,n1.y);
	    n0.c2d.stroke();
	}
    }
    draw(params,draw_trace,draw_labels) {
	//console.log("graph.draw() has been called");
        for (let i in this.ns) {
            Node.draw(this.ns[i],params,draw_trace,draw_labels);
	    for (let j of this.adj[i])
		if (j < i)
		    this.constructor.draw_edge(this.ns[i],this.ns[j],params,draw_trace,draw_labels);
        }
	this.draw_path();
    }
    calc_forces() {
        for(let a_key in this.ns) {
            this.ns[a_key].reset_force();
        }
	for (let i in this.ns)
	    for (let j in this.ns)
                if (i != j) {
		    if(this.adj[i].includes(Number(j)))
			this.ns[i].add_force_connected(this.ns[j]);
		    else
			this.ns[i].add_force_unconnected(this.ns[j]);
		}
    }
    step() {
        this.calc_forces();
        for(let a_key in this.ns) {
            this.ns[a_key].step();
        }
    }
    refresh_colours(cols,rnd) {
	for(let a_key in this.ns)
	    this.ns[a_key].refresh_colours(cols,rnd);
    }
    nudge(dir) {
	for(let a_key in g.ns) {
	    switch(dir) {
	    case 'up':
		g.ns[a_key].move_up();
		break;
	    case 'down':
		g.ns[a_key].move_down();
		break;
	    case 'left':
		g.ns[a_key].move_left();
		break;
	    case 'right':
		g.ns[a_key].move_right();
		break;
	    default:
		console.log("Undefined direction: " + dir);
	    }
        }
    }
    resize_nodes(new_size0,new_size1) {
	for (let a_key in this.ns) {
            this.ns[a_key].size0=Number(new_size0);
	    this.ns[a_key].size1=Number(new_size1);
        }
    }
    unvisit_nodes() {
	for (let a_key in this.ns)
	    this.ns[a_key].unvisit();
    }
    get_edge_list(delim,quot) {
	let output_string = "";
	for(let i in this.adj) {
		for(let j of this.adj[i]) {
		    output_string += quot + this.ns[i].name + quot + delim + quot + this.ns[j].name + quot + "\n";
		    //console.log(output_string);
		}
	}
	return output_string;
    }
    static draw_edge(n0,n1,p,draw_trace,draw_labels) {
	if (!p.line_colour)
            n0.c2d.strokeStyle = draw_trace ? n0.tracelinecolour : n0.linecolour;
        n0.c2d.beginPath();
	const coords1 = Node.get_point(n0,n1);
	const coords2 = Node.get_point(n1,n0);
	n0.c2d.moveTo(coords1[0], coords1[1]);
	n1.c2d.lineTo(coords2[0], coords2[1]);
	if (!p.line_colour)
            n0.c2d.stroke();
    }
    static discover_a_group(gr,adji,group_colour,the_group,cols) {
	for(let ni of gr.adj[adji]) {
	    if (!gr.ns[ni].visited)
		the_group.push(ni);
	     else
		continue;
	    if (cols)
		this.colour_node(gr,ni,group_colour);
	    gr.ns[ni].visit();
	    this.discover_a_group(gr,ni,group_colour,the_group,cols);
	}
    }
    static discover_node_groups(gr,cols=true) {
	const groups = [];
	gr.unvisit_nodes();
	for(let a_key in gr.ns) {
	    if (gr.ns[a_key].visited)
		continue;
	    const a_group = [];
	    const group_col = get_next_safe_colour();
	    this.colour_node(gr,a_key,group_col);
	    a_group.push(a_key);
	    this.discover_a_group(gr,a_key,group_col,a_group,cols);
	    groups.push(a_group);
	}
	gr.unvisit_nodes();
	return(groups)
    }
    static colour_node(gr,ni,col) {
	gr.ns[ni].fillcolour = "#" + col;
	gr.ns[ni].linecolour = "#" + col;
    }
    static connect_node_groups_first(gr) {
	const islands = this.discover_node_groups(gr);
	for(let i = 1; i < islands.length; ++i) {
	    const ind1 = islands[i][0];
	    const ind2 = islands[i-1][0];
	    gr.add_edge(ind1,ind2);
	}
    }
    static sort_islands_by_length(islnds) {
	return islnds.sort((a,b) => b.length - a.length);
    }
    static connect_node_groups_rand(gr) {
	let islands = this.sort_islands_by_length(this.discover_node_groups(gr));
	while(islands.length > 1) {
	    const i0 = Math.floor(Math.random()*islands[0].length);
	    const i1 = Math.floor(Math.random()*islands[1].length);
	    const ind0 = islands[0][i0];
	    const ind1 = islands[1][i1];
	    gr.add_edge(ind0,ind1);
	    islands = this.sort_islands_by_length(this.discover_node_groups(gr,false));
	}
    }
    static connect_node_groups(gr,rnd_id) {
	document.getElementById(rnd_id).checked ? this.connect_node_groups_rand(gr) : this.connect_node_groups_first(gr);
    }
}
