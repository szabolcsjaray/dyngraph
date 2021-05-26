class Graph {
    constructor(name) {
        this.name = name;
	this.nu_vertices = 0;
	this.nu_edges = 0;
        this.ns = [];
	this.sn = {};
	//this.vertnames = [];
	this.adj = {};
	this.badj = {};
	this.path = [];
	this.path_col = "#ff00ff";
    }
    addNode(node) {
        this.ns.push(node);
	this.sn[node.name] = node;
	this.adj[this.nu_vertices] = [];
	this.badj[this.nu_vertices] = [];
	++this.nu_vertices;
        return this.ns.length-1;
    }
    remNodeByName(name) {
	if(this.sn[name]===undefined)
	    return false;
	if (this.remNode(this.ns.indexOf(this.sn[name])))
	    return true;
	return false;
    }
    remNode(ind) {
	if(ind < 0)
	    return false;
	const the_node = this.ns[ind];
	for(let i = the_node.links.length-1; i >= 0; --i) {
	    the_node.disconnect(the_node.links[i]);
	    --this.nu_edges;
	}
	for(let i = the_node.backLinks.length-1; i >= 0; --i) {
	    the_node.backLinks[i].disconnect(the_node);
	    --this.nu_edges;
	}
	delete this.sn[this.ns[ind].name];
	this.ns.splice(ind,1);
	this.remLinks(ind,this.adj,this.badj);
	this.remLinks(ind,this.badj,this.adj);
	delete this.adj[ind];
	delete this.badj[ind];
	--this.nu_vertices;
	return true;
    }
    addLink(index1, index2) {
        if (index1<0 || index1>=this.ns.length || index2<0 || index2>=this.ns.length)
            return false;
	if (!this.is_connected(index1,index2) && index1 != index2) {
            this.ns[index1].connect(this.ns[index2]);
	    ++this.nu_edges;
	    this.adj[index1].push(index2);
	    this.badj[index2].push(index1);
	    return true;
	}
	return false;
    }
    remLink(index1, index2) {
	if (!this.is_connected(index1,index2))
	    return false;
	if (this.ns[index1].disconnect(this.ns[index2]))
	    --this.nu_edges;
	this.remLink2(index1,index2);
    }
    remLinks(ind1,adj1,adj2) {
	for(let ind2 of adj1[ind1])
	    adj2[ind2].splice(adj2[ind2].indexOf(ind1),1);
    }
    remLink2(index1,index2) {
	const ind_to_remove1 = this.adj[index1].indexOf(index2);
	if(ind_to_remove1 > -1)
	    this.adj[index1].splice(ind_to_remove1,1);
	else {
	    console.log("no link between " + index1 + " and " + index2);
	    return false;
	}
	const ind_to_remove2 = this.badj[index2].indexOf(index1);
	if(ind_to_remove2 > -1)
	    this.badj[index2].splice(ind_to_remove2,1);
	else {
	    console.log("no link between " + index2 + " and " + index1);
	    return false;
	}
	return true;
    }
    reposition_node(num,xpos,ypos) {
	this.ns[num].x = xpos;
	this.ns[num].y = ypos;
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
	for(let i = 1; i < this.path.length; ++i) {
	    let n0 = this.ns[this.path[i-1]];
	    let n1 = this.ns[this.path[i]];
	    //const saved_stroke = n0.c2d.strokeStyle;
	    n0.c2d.strokeStyle = this.path_col;
	    //n0.c2d.fillStyle = this.path_col;
	    n0.c2d.moveTo(n0.x,n0.y);
	    n0.c2d.lineTo(n1.x,n1.y);
	    n0.c2d.stroke();
	    //n0.c2d.strokeStyle = saved_stroke;
	    //n0.c2d.fill();
	}
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
