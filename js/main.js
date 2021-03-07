let g;
let canv;
let c2d;
let tracing;
let node_size = 5;
const colours = {
    fill_colour: "#000000",
    outline_col: "#000000",
    line_colour: "#ffffff",
    trc_fil_col: "#777777",
    trc_lin_col: "#555555"
};
let graph_algorithm = 0;
let animate;
let time_out = 10;
const min_num = 0;
const rnd_pairs = {
    rnd_fil_col: false,
    rnd_lin_col: false,
    rnd_trc_fil: false,
    rnd_trc_col: false,
    rnd_oli_col: false,
    fil_col_off: false,
    lin_col_off: false,
    oli_col_off: false,
    trc_fil_off: false,
    trc_col_off: false
};

function gen_num(nmax,nmin=min_num) {
    if (nmax < nmin) {
	const tmp = nmax;
	nmax = nmin;
	nmin = tmp;
    }
    return(Math.floor((Math.random() * (nmax-nmin+1)) + nmin));
}

function gen_colour() {
    red = gen_num(255);
    green = gen_num(255);
    blue = gen_num(255);
    the_colour = "#"+Number(red).toString(16).padStart(2,'0')+Number(green).toString(16).padStart(2,'0')+Number(blue).toString(16).padStart(2,'0');
    //console.log("colour: " + the_colour);
    return the_colour;
}

function set_graph_alg(a) {
    graph_algorithm = Number(a);
}

function print_edges(target) {
    target.value = g.get_edge_list();
}

function add_nodes(g, num) {
    for(let i = 0;i<num;i++) {
        g.addNode(new Node('n'+i, 'c', node_size,
			   rnd_pairs["rnd_fil_col"] ? gen_colour() : colours["fill_colour"],
			   rnd_pairs["rnd_oli_col"] ? gen_colour() : colours["outline_col"],
			   rnd_pairs["rnd_lin_col"] ? gen_colour() : colours["line_colour"],
			   Math.random()*800+100,
			   Math.random()*800+100, c2d));
    }
}

function add_named_nodes(g,node_names) {
    for(let i in node_names) {
	// console.log("node name: " + node_names[i]);
	g.addNode(new Node(node_names[i], 'c', node_size,
			   colours["fill_colour"],
			   colours["outline_col"],
			   colours["line_colour"],
			   Math.random()*800+100,
			   Math.random()*800+100, c2d));
    }
}

function get_edge_list() {
    const edges = area_edgelist.value.split('\n');
    let split_edges = [];
    for (let i in edges) {
	const a_pair = edges[i].split(" ");
	if (a_pair.length != 2)
	    continue;
	split_edges.push(a_pair);
    }
    return split_edges;
}

function get_node_list(edges) {
    let nodes = [];
    for(let i in edges) {
	const a_pair = edges[i];
	for(let j in a_pair)
	    if (nodes.indexOf(a_pair[j]) == -1)
		nodes.push(a_pair[j]);
    }
    return nodes;
}

function start(canv_name="c",
	       nnodes=100,
	       nedges=100) {
    canv = document.getElementById(canv_name);
    c2d = canv.getContext("2d");
    const num_nodes = nnodes;
    //console.log("nodes: " + num_nodes);
    const num_edges = nedges;
    //console.log("edges: " + num_edges);
    btn_stop.disabled = false;
    btn_pause.disabled = false;
    btn_cont.disabled = true;

    clear_canvas();
    g = new Graph('trygraph');

    switch(graph_algorithm) {
    case 0:
	//console.log("Random to random algorithm.");
	add_nodes(g,num_nodes);
	//console.log(g.ns);
	for(let i = 0;i<num_edges;++i) {
	    let n1 = Math.floor(Math.random()*num_nodes);
	    let n2 = Math.floor(Math.random()*num_nodes);
	    if (!g.ns[n1].is_connected(g.ns[n2]) && n1 != n2)
		g.addLink(n1,n2);
	}
	break;
    case 1:
	//console.log("Sequential to random algorithm.");
	add_nodes(g,num_nodes);
	let n = 0;
	for(let i = 0;i < num_edges;++i,++n) {
	    if (n == num_nodes)
		n = 0;
	    let n1 = n;
	    let n2 = Math.floor(Math.random()*num_nodes);
	    if (!g.ns[n1].is_connected(g.ns[n2]) && n1 != n2)
		g.addLink(n1,n2);
	}
	break;
    case 2:
	//console.log("Graph from edge list.");
	const edges = get_edge_list();
	//console.log("number of edges: " + edges.length);
	const nodes = get_node_list(edges);
	//console.log("number of nodes: " + nodes.length);
	//console.log("nodes: " + nodes);
	add_named_nodes(g,nodes);
	//console.log("nodes in g: " + g.ns);
	for(let i in edges) {
	    if (edges[i].length != 2)
		continue;
	    //console.log(edges[i]);
	    g.addLink(nodes.indexOf(edges[i][0]),nodes.indexOf(edges[i][1]));
	}
	break;
    default:
	console.log("Invalid graph algorithm code: " + graph_algorigthm);
    }

    animate=true;
    animPhase();
}

function clear_canvas(from_x=0,
		      from_y=0,
		      to_x=canv.width,
		      to_y=canv.height,
		      c=canv) {
    const ctx = c.getContext('2d');
    ctx.clearRect(from_x, from_y, to_x, to_y);
}

function stop() {
    animate = false;
}

function pause() {
    animate=false;
    btn_cont.disabled = false;
    btn_pause.disabled = true;
}

function go_on() {
    animate = true;
    animPhase();
    btn_cont.disabled = true;
    btn_pause.disabled = false;
    btn_stop.disabled = false;
}

function col_sel_change(cb_id,sel_id,v) {
    const cb = document.getElementById(cb_id);
    const sel = document.getElementById(sel_id);
    sel.disabled = cb.checked ? true : false;
    rnd_pairs[v] = cb.checked ? true : false;
    //console.log(v + " should change to " + (cb.checked ? true : false));
}

function col_off_change(off_cb_id,rnd_cb_id,sel_id,v) {
    const off_cb = document.getElementById(off_cb_id);
    const rnd_cb = document.getElementById(rnd_cb_id);
    const sel = document.getElementById(sel_id);
    if (off_cb.checked) {
	sel.disabled = true;
	rnd_cb.disabled = true;
	rnd_pairs[v] = true;
    } else {
	sel.disabled = false;
	rnd_cb.disabled = false;
	rnd_pairs[v] = false;
    }
    //console.log(v + " should change to " + (cb.checked ? true : false));
}

function check_tracer(t=tracer) {
    if(t.checked) {
	console.log("trace: on");
	tracing = true;
	return true;
    } else {
	console.log("trace: off");
	tracing = false;
	return false;
    }
}

function animPhase() {
    // c2d.fillStyle = rnd_pairs["rnd_trc_fil"] ? gen_colour() : colours["fill_colour"];
    // c2d.strokeStyle= rnd_pairs["rnd_trc_col"] ? gen_colour() : colours["line_colour"];
    g.draw(!rnd_pairs["lin_col_off"],!rnd_pairs["oli_col_off"],!rnd_pairs["fil_col_off"]);
    g.calcForces();
    g.step();
    if(!tracing)
	clear_canvas();
    g.draw(!rnd_pairs["lin_col_off"],!rnd_pairs["oli_col_off"],!rnd_pairs["fil_col_off"]);
    if (animate) {
        setTimeout(animPhase, time_out);
    } else {
	btn_stop.disabled = true;
	btn_pause.disabled = true;
    }
}
