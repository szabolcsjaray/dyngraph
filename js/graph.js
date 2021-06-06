class Graph {
    constructor(name) {
        this.name = name;
	this.nu_vertices = 0;
	this.nu_edges = 0;
        this.ns = [];
	this.sn = {};
	this.adj = {};
	this.path = [];
	this.path_col = "#ff00ff";
    }
    add_vertex(node) {
        this.ns.push(node);
	this.sn[node.name] = node;
	this.adj[this.nu_vertices] = [];
	++this.nu_vertices;
        return this.ns.length-1;
    }
    rem_vertex_by_name(name) {
	if(this.sn[name]===undefined)
	    return false;
	if (this.rem_vertex(this.ns.indexOf(this.sn[name])))
	    return true;
	return false;
    }
    rem_vertex(ind) {
	if(ind < 0 || this.nu_vertices <= ind)
	    return false;
	const the_node = this.ns[ind];
	delete this.sn[this.ns[ind].name];
	this.ns.splice(ind,1);
	this.remLinks(ind,this.adj);
	delete this.adj[ind];
	--this.nu_vertices;
	return true;
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
    reposition_node(num,xpos,ypos) {
	this.ns[num].x = xpos;
	this.ns[num].y = ypos;
    }
    is_connected(index1,index2) {
	//console.log(`is connected? ${index1} and ${index2}`);
	return(this.adj[index1].includes(index2) || this.adj[index2].includes(index1));
    }
    draw_path() {
	for(let i = 1; i < this.path.length; ++i) {
	    let n0 = this.ns[this.path[i-1]];
	    let n1 = this.ns[this.path[i]];
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
        this.ns.forEach( node => {
            node.reset_force();
        });
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
        this.ns.forEach( node => {
            node.step();
        });
    }
    refresh_colours(cols,rnd) {
        this.ns.forEach( node => {
            node.refresh_colours(cols,rnd);
        });
    }
    nudge(dir) {
	this.ns.forEach( node => {
	    switch(dir) {
	    case 'up':
		node.move_up();
		break;
	    case 'down':
		node.move_down();
		break;
	    case 'left':
		node.move_left();
		break;
	    case 'right':
		node.move_right();
		break;
	    default:
		console.log("Undefined direction: " + dir);
	    }
        });
    }
    resize_nodes(new_size0,new_size1) {
	this.ns.forEach( node => {
            node.size0=Number(new_size0);
	    node.size1=Number(new_size1);
        });
    }
    unvisit_nodes() {
	this.ns.forEach( node => {
	    node.unvisit();
	});
    }
    get_edge_list(delim,quot) {
	let output_string = "";
	for(let i in this.ns) {
		for(let j in this.ns[i].links) {
		    output_string += quot + this.ns[i].name + quot + delim + quot + this.ns[i].links[j].name + quot + "\n";
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
    static discover_a_group(a_node,group_colour,the_group,cols) {
	if (!a_node.visited)
	    the_group.push(a_node);
	else
	    return;
	if (cols) {
	    a_node.fillcolour = "#" + group_colour;
	    a_node.linecolour = "#" + group_colour;
	}
	a_node.visit();
	const queue = [];
	for (let i = 0; i < a_node.links.length; ++i) {
	    if (!a_node.links[i].visited)
		queue.push(a_node.links[i]);
	}
	for (let i = 0; i < a_node.backLinks.length; ++i) {
	    if (!a_node.backLinks[i].visited)
		queue.push(a_node.backLinks[i]);
	}
	while(queue.length > 0) {
	    this.discover_a_group(queue.shift(),group_colour,the_group,cols);
	}
    }
    static discover_node_groups(gr,cols=true) {
	const groups = [];
	gr.unvisit_nodes();
	for(let i = 0; i < gr.ns.length; ++i) {
	    if (gr.ns[i].visited)
		continue;
	    const a_group = [];
	    this.discover_a_group(gr.ns[i],get_next_safe_colour(),a_group,cols);
	    groups.push(a_group);
	}
	gr.unvisit_nodes();
	return(groups)
    }
    static connect_node_groups_first(gr) {
	const islands = this.discover_node_groups(gr);
	for(let i = 1; i < islands.length; ++i) {
	    //islands[i][0].connect(islands[i-1][0]);
	    const ind1 = gr.ns.indexOf(islands[i][0]);
	    const ind2 = gr.ns.indexOf(islands[i-1][0]);
	    gr.addLink(ind1,ind2);
	    //++gr.nu_edges;
	}
    }
    static sort_islands_by_length(islnds) {
	return islnds.sort((a,b) => b.length - a.length);
    }
    static connect_node_groups_rand(gr) {
	let islands = this.sort_islands_by_length(this.discover_node_groups(gr));
	while(islands.length > 1) {
	    const i0= Math.floor(Math.random()*islands[0].length);
	    const i1 = Math.floor(Math.random()*islands[1].length);
	    const ind0 = gr.ns.indexOf(islands[0][i0]);
	    const ind1 = gr.ns.indexOf(islands[1][i1]);
	    //islands[0][i0].connect(islands[1][i1]);
	    //++gr.nu_edges;
	    gr.addLink(ind0,ind1);
	    islands = this.sort_islands_by_length(this.discover_node_groups(gr,false));
	}
    }
    static connect_node_groups(gr,rnd_id,nu_edges_id) {
	document.getElementById(rnd_id).checked ? this.connect_node_groups_rand(gr) : this.connect_node_groups_first(gr);
	document.getElementById(nu_edges_id).value = gr.nu_edges;
    }
}
