class Graph {
    constructor(name) {
        this.name = name;
	this.nu_edges = 0;
        this.ns = [];
    }

    addNode(node) {
        this.ns.push(node);
        return this.ns.length-1;
    }

    addLink(index1, index2) {
        if (index1<0 || index1>=this.ns.length || index2<0 || index2>=this.ns.length)
            return false;
	if (!this.is_connected(index1,index2) && index1 != index2) {
            this.ns[index1].connect(this.ns[index2]);
	    ++this.nu_edges;
	    return true;
	}
	return false;
    }
    remLink(index1, index2) {
	if (!this.is_connected(index1,index2))
	    return false;
	if (this.ns[index1].disconnect(this.ns[index2]))
	    --this.nu_edges;
	return true;
    }
    is_connected(index1,index2) {
	return(Node.is_connected(this.ns[index1],this.ns[index2]));
    }
    // add_uni_link(index1, index2) {
    // 	this.ns[index1].add_uni_link(this.ns[index2]);
    // }

    draw(params,draw_trace,draw_labels) {
	//console.log("graph.draw() has been called");
        this.ns.forEach( node => {
            Node.draw(node,params,draw_trace,draw_labels);
        });
    }

    calcForces() {
        this.ns.forEach( node => {
            node.resetForce();
        });
        this.ns.forEach( node => {
            this.ns.forEach( otherNode => {
                if (node!=otherNode) {
                    node.addForce(otherNode);
                }
            })
        });
    }

    rem_node(ind) {
	for(let n of this.ns[ind].links) {
	    this.ns[ind].disconnect(n);
	    --this.nu_edges;
	}
	for(let n of this.ns[ind].backLinks) {
	    n.disconnect(this.ns[ind]);
	}
	this.ns.splice(ind,1);
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
    
    step() {
        this.calcForces();
        this.ns.forEach( node => {
            node.step();
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
	    islands[i][0].connect(islands[i-1][0]);
	    ++gr.nu_edges;
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
	    islands[0][i0].connect(islands[1][i1]);
	    ++gr.nu_edges;
	    islands = this.sort_islands_by_length(this.discover_node_groups(gr,false));
	}
    }

    static connect_node_groups(gr,rnd_id,nu_edges_id) {
	document.getElementById(rnd_id).checked ? this.connect_node_groups_rand(gr) : this.connect_node_groups_first(gr);
	document.getElementById(nu_edges_id).value = gr.nu_edges;
    }
}
