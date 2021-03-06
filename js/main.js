let g;
let canv;
let c2d;
//let count;
let num_steps;
let tracing;
//let saved_count;
let fill_colour;
let line_colour;
let trace_fill_colour;
let trace_line_colour;
let graph_algorithm = 0;
let animate = true;
let rand_colour = false;
let rand_trace_colour = false;
const min_num = 0;

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
    console.log("colour: " + the_colour);
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
        g.addNode(new Node('n'+i, 'c',
			   rand_colour ? gen_colour() : fill_colour,
			   rand_colour ? gen_colour() : line_colour,
			   Math.random()*800+100,
			   Math.random()*800+100, c2d));
    }
}

function add_named_nodes(g,node_names) {
    for(let i in node_names) {
	// console.log("node name: " + node_names[i]);
	g.addNode(new Node(node_names[i], 'c',
			   fill_colour,
			   line_colour,
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
	       nedges=100,
	       nsteps=2000) {
    canv = document.getElementById(canv_name);
    c2d = canv.getContext("2d");
    num_steps = nsteps;
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
	console.log("Random to random algorithm.");
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
	console.log("Sequential to random algorithm.");
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
	console.log("Graph from edge list.");
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

    //g.list_connections();
//    count = 0;
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
    //count = num_steps;
    //saved_count = num_steps;
    animate = false;
}

function pause() {
    //saved_count = count;
    //console.log("saved: " + saved_count);
    //count = num_steps;
    animate=false;
    btn_cont.disabled = false;
    btn_pause.disabled = true;
}

function go_on() {
    //count = saved_count;
    //console.log("count: " + count);
    //saved_count = 0;
    animate = true;
    animPhase();
    btn_cont.disabled = true;
    btn_pause.disabled = false;
    btn_stop.disabled = false;
}

function check_randcol(r=cb_randcol) {
    if(r.checked) {
	console.log("random colour: on");
	rand_colour = true;
	sel_fillcol.disabled = true;
	sel_linecol.disabled = true;
	return true;
    } else {
	console.log("random colour: off");
	rand_colour = false;
	sel_fillcol.disabled = false;
	sel_linecol.disabled = false;
	return false;
    }
}

function check_rand_tracecol(r=cb_rand_tracecol) {
    if(r.checked) {
	console.log("random trace colour: on");
	rand_trace_colour = true;
	sel_tracefill.disabled = true;
	sel_traceline.disabled = true;
	return true;
    } else {
	console.log("random trace colour: off");
	rand_trace_colour = false;
	sel_tracefill.disabled = false;
	sel_traceline.disabled = false;
	return false;
    }
}

function check_tracer(t=tracer) {
    if(t.checked) {
	console.log("trace: on");
	tracing = true;
	cb_rand_tracecol.disabled = false;
	check_rand_tracecol();
	return true;
    } else {
	console.log("trace: off");
	tracing = false;
	cb_rand_tracecol.disabled = true;
	sel_tracefill.disabled = true;
	sel_traceline.disabled = true;
	return false;
    }
}

function animPhase() {
    //count++;
    c2d.fillStyle = rand_trace_colour ? gen_colour() : trace_fill_colour;
    c2d.strokeStyle= rand_trace_colour ? gen_colour() : trace_line_colour;
    g.draw(false);
    g.calcForces();
    g.step();
    if(!tracing)
	clear_canvas();
    g.draw();
    //if(count<num_steps) {
    if (animate) {
        setTimeout(animPhase, 10);
    } else {
	btn_stop.disabled = true;
	btn_pause.disabled = true;
    }
}
