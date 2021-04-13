const elem_delim = ",";
const elem_quote = '"';
const elem_endl = "\n";

let g;
let node_radius = 5;
const colours = {
    back_colour: "#171412", // 墨色 「すみいろ」
    fill_colour: "#48929B", // 浅葱色「あさぎいろ」
    font_colour: "#DC3023", // 猩々緋「しょうじょうひ」
    outline_col: "#1D697C", // 浅葱色「あさぎいろ」
    line_colour: "#86ABA5", // 水色「みずいろ」
    trc_fil_col: "#2B3736", // 鉄御納戸「てつおなんど」
    trc_oli_col: "#364141", // 御納戸色「おなんどいろ」
    trc_lin_col: "#344D56", // 熨斗目花色「のしめはないろ」
};
let graph_algorithm = 0;
let animate;
let scatter = 0.8;
let scat = 800;
let offs = 100;
let node_shape;
const node_size = {
    s0: 5,
    s1: 5
};
const time_out = 10;
const min_num = 0;
const off_pairs = {};
const rnd_pairs = {};
for (let a_key in colours) {
    off_pairs[a_key] = false;
    rnd_pairs[a_key] = false;
}

// 1. go over node list
// 2. colour the connected groups with the same colour (links and backLinks of the nodes to be visited)
// 3. connections discovered -> to queue
//    (groups will follow each other)
// 4. connect groups to each other
//    opt A: chain
//    opt B: circular
//    opt C: random
// 5. lone nodes to be dealt with at the end
//    opt A: first, connect them to each other, then connect one or two to main chain
//    opt B: each to be connected to main branch one by one
// function find_islands() {
//     let conn = [];
//     let uncon = [];
//     let queue = [];
//     for(let i = 0; i < g.ns.length; ++i) {
// 	const n = g.ns[i];
// 	if (n.links.length == 0 && n.backLinks.length == 0)
// 	    uncon.push(n);
// 	else {
// 	    for (let j = 0; j < n.links.length; ++j) {
// 		const m = n.links[j];
// 	    }
// 	}
//     }
// }

function nudge(dir) {
    g.nudge(dir);
}

function refresh_colours() {
    g.refresh_colours(colours,rnd_pairs);
}

function change_shape(sel_id) {
    const sels = document.getElementById(sel_id);
    const seli = sels.selectedIndex;
    node_shape = sels[seli].value;
}

function sync_back_shape_selection(sel_id) {
    const sels = document.getElementById(sel_id);
    for(let seli = 0; seli < sels.length; ++seli) {
	if(sels[seli].value == node_shape)
	    sels[seli].selected = true;
	else
	    sels[seli].selected = false;
    }
    sels.dispatchEvent(new Event('change'));
}

function gen_num(nmax,nmin=min_num) {
    if (nmax < nmin) {
	const tmp = nmax;
	nmax = nmin;
	nmin = tmp;
    }
    return(Math.floor((Math.random() * (nmax-nmin+1)) + nmin));
}

function gen_colour(type=2,alpha=0.9) {
    const red = gen_num(255);
    const green = gen_num(255);
    const blue = gen_num(255);
    let the_colour;
    switch(type) {
    case 0:
	the_colour = "#"+Number(red).toString(16).padStart(2,'0')+Number(green).toString(16).padStart(2,'0')+Number(blue).toString(16).padStart(2,'0');
	break;
    case 1:
	the_colour = "rgba("+red+","+green+","+blue+","+alpha+")";
	break;
    case 2:
	the_colour = "rgb("+red+","+green+","+blue+")";
	break;
    default:
	console.log("Invalid colour type: " + type);
    }
    return the_colour;
}


function resize_linewidth(sz) {
    c2d.lineWidth = sz;
}

function resize_nodes(sz_id0,sz_id1) {
    const sz0 = document.getElementById(sz_id0);
    let sz1 = document.getElementById(sz_id1);
    if (!sz1)
	sz1 = sz0;
    node_size.s0 = Number(sz0.value);
    node_size.s1 = Number(sz1.value);
    g.resize_nodes(node_size.s0,node_size.s1);
}

function sync_back_node_sizes(sz_id0,sz_id1) {
    const sz0 = document.getElementById(sz_id0);
    const sz1 = document.getElementById(sz_id1);
    sz0.value = Number(node_size.s0);
    if(sz1)
	sz1.value = Number(node_size.s1);
}

function update_scatter(scatter_value,c=canv) {
    scatter = Math.abs(Number(scatter_value) / 100);
    const sc_off = Math.abs(1 - scatter) / 2;
    scat = Math.round(c.width * scatter);
    offs = Math.round(c.width * sc_off);
}

function set_graph_alg(a) {
    graph_algorithm = Number(a);
}

function add_node_at_random_pos(gr,name,shape) {
    gr.addNode(new Node(name, shape, node_size.s0, node_size.s1,
			colours,
			rnd_pairs,
			Math.random()*scat+offs,
			Math.random()*scat+offs, c2d));
}

function print_edges(target,delim=elem_delim,quot=elem_quote) {
    target.value = g.get_edge_list(delim,quot);
}

function add_nodes(g, num) {
    for(let i = 0;i<num;i++)
	add_node_at_random_pos(g,'n'+i,node_shape,node_size.s0, node_size.s1);
}

function add_named_nodes(g,node_names) {
    for(let i in node_names)
	add_node_at_random_pos(g,node_names[i],node_shape);
}

function rem_spec_chars(str_pair){
    for(let i in str_pair) {
	if(str_pair[i] == null || str_pair[i] == '')
            continue;
	str_pair[i] = str_pair[i].replace(/[^a-zA-Z0-9 _]/g, '');
    }
}

function proc_unquoted_csv(str,delim,endl) {
    const edges = str.split(endl);
    const split_edges = [];
    for (let i in edges) {
	const a_pair = edges[i].split(delim);
	if (a_pair.length != 2)
	    continue;
	split_edges.push(a_pair);
    }
    return(split_edges);
}

function proc_quoted_csv(str,quot,delim,endl) {
    const in_str = new String(str);
    const edge_list = [];
    //const inStr = new String(str);
    let in_quot = false;
    let line_arr = [];
    let item_str = "";
    //console.log("received: |" + str + "|");
    for (let ch of in_str) {
	//console.log("char: " + ch);
	if (ch == quot) {
	    in_quot = in_quot ? false : true;
	    continue;
	}
	if (in_quot) {
	    item_str += ch;
	    continue;
	}
	if (ch == delim) {
	    line_arr.push(item_str);
	    item_str = "";
	    continue;
	}
	if (ch == endl) {
	    line_arr.push(item_str);
	    item_str = "";
	    edge_list.push(line_arr);
	    line_arr = [];
	    continue;
	}
    }
    if(item_str.length > 0)
	line_arr.push(item_str);
    if(line_arr.length > 0)
	edge_list.push(line_arr);
    //console.table(edge_list);
    return edge_list;
}

function get_edge_list(quote=elem_quote,delim=elem_delim,endl=elem_endl) {
    let edgelist_str = area_edgelist.value.trim();
    const r = new RegExp("[" + quote + "]",'gm');
    const q = edgelist_str.match(r);
    //console.log("quote count: " + (!q ? 0 : q.length));
    
    return(!q ? proc_unquoted_csv(edgelist_str,delim,endl) : proc_quoted_csv(edgelist_str,quote,delim,endl));
}

function get_node_list(edges) {
    let nodes = [];
    for(let i in edges) {
	const a_pair = edges[i];
	//rem_spec_chars(a_pair);
	for(let j in a_pair)
	    if (nodes.indexOf(a_pair[j]) == -1)
		nodes.push(a_pair[j]);
    }
    return nodes;
}

function make_r2r_graph(nuno,nued) {
    const gr = new Graph('r2r'); 
    add_nodes(gr,nuno);
    for(let i = 0;i<nued;++i) {
	let n1 = Math.floor(Math.random()*nuno);
	let n2 = Math.floor(Math.random()*nuno);
	if (!gr.ns[n1].is_connected(gr.ns[n2]) && n1 != n2)
	    gr.addLink(n1,n2);
    }
    return(gr);
}

function make_s2r_graph(nuno,nued) {
    const gr = new Graph('s2r');
    add_nodes(gr,nuno);
    let n = 0;
    for(let i = 0;i < nued;++i,++n) {
	if (n == nuno)
	    n = 0;
	let n1 = n;
	let n2 = Math.floor(Math.random()*nuno);
	if (!gr.ns[n1].is_connected(gr.ns[n2]) && n1 != n2)
	    gr.addLink(n1,n2);
    }
    return(gr);
}

function make_a2a_graph(nuno) {
    const gr = new Graph('a2a');
    add_nodes(gr,nuno);

    for(let i = 0;i < nuno;++i)
	for (let j = i; j < nuno; ++j)
	     gr.addLink(i,j);
	     
    return(gr);
}

function make_circular_graph(nuno) {
    const gr = new Graph('circular');
    add_nodes(gr,nuno);
    let i;
    for(i = 1; i < nuno; ++i)
	gr.addLink(i-1,i);
    gr.addLink(i-1,0);
    return(gr);
}

function make_linear_graph(nuno) {
    const gr = new Graph('circular');
    add_nodes(gr,nuno);
    for(let i = 1; i < nuno; ++i)
	gr.addLink(i-1,i);
    return(gr);
}


function make_central_graph(nuno) {
    const gr = new Graph('central');
    add_nodes(gr,nuno);
    for(let i = 1; i < nuno; ++i)
	gr.addLink(0,i);
    return(gr);
}

function make_triangulated_graph(nuno) {
    const gr = new Graph('triangulated');
    add_nodes(gr,nuno);
    if (nuno <= 1)
	return(gr);
    gr.addLink(0,1);
    let i;
    for(i = 2; i < nuno; ++i) {
	gr.addLink(0,i);
	gr.addLink(i-1,i);
    }
    gr.addLink(i-1,1);
    return(gr);
}

function make_ladder_graph(nuno) {
    const gr = new Graph('ladder');
    if (nuno % 2 != 0)
	++nuno;
    add_nodes(gr,nuno);
    if (nuno == 0)
	return gr;
    gr.addLink(0,1);
    for (let i = 2; i < nuno; i+=2) {
	gr.addLink(i-2,i);
	gr.addLink(i-1,i+1);
	gr.addLink(i,i+1);
	}
    return(gr);
}

function make_matrix_graph(nuno) {
    const gr = new Graph('ladder');
    const d = Math.ceil(Math.sqrt(nuno));
    add_nodes(gr,Math.pow(d,2));
    let n = 0;
    for(let i = 0; i < d; ++i) {
	for(let j = 0; j < d; ++j,++n) {
	    if(j>0)
		gr.addLink(n-1,n);
	    if(i>0)
		gr.addLink(n-d,n);
	}
    }
    return(gr);
}

function make_tree_graph(nuno,nubr,c=canv) {
    const gr = new Graph(Number(nubr).toString() + 'tree');
    const queue = [];
    gr.addNode(new Node('n0', node_shape, node_size.s0, node_size.s1,
			colours,
			rnd_pairs,
			c.width/2,
			c.height/2, c2d));
    queue.push(0);
    for(let i = 1; i < nuno; ++i) {
	while(queue.length) {
	    const ni = queue.shift();
	    for(let b = 0; b < nubr && i < nuno; ++b,++i) {
		add_node_at_random_pos(gr,'n'+i,node_shape);
		queue.push(i);
		gr.addLink(ni,i);
	    }
	}
    }
    return(gr);
}

function make_el_graph() {
    const gr = new Graph('el');
    const edges = get_edge_list();
    const nodes = get_node_list(edges);
    add_named_nodes(gr,nodes);
    for(let i in edges) {
	if (edges[i].length != 2)
	    continue;
	gr.addLink(nodes.indexOf(edges[i][0]),nodes.indexOf(edges[i][1]));
    }
    return(gr);
}

function update_global_alpha(nalpha) {
    c2d.globalAlpha = nalpha;
}

function start(c2d,nnodes,nedges,nbranches,nalpha) {
    c2d.globalAlpha = nalpha;
    const num_nodes = nnodes;
    const num_edges = nedges;
    const num_branches = nbranches;

    clear_canvas();

    switch(graph_algorithm) {
    case 0:
	g = make_r2r_graph(num_nodes,num_edges);
	break;
    case 1:
	g = make_s2r_graph(num_nodes,num_edges);
	break;
    case 2:
	g = make_a2a_graph(num_nodes);
	break;
    case 3:
	g = make_tree_graph(num_nodes,num_branches);
	break;
    case 4:
	g = make_el_graph();
	break;
    case 5:
	g = make_circular_graph(num_nodes);
	break;
    case 6:
	g = make_central_graph(num_nodes);
	break;
    case 7:
	g = make_linear_graph(num_nodes);
	break;
    case 8:
	g = make_ladder_graph(num_nodes);
	break;
    case 9:
	g = make_matrix_graph(num_nodes);
	break;
    case 10:
	g = make_triangulated_graph(num_nodes);
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
		      ctx=c2d) {
    ctx.clearRect(from_x, from_y, to_x, to_y);
    if(!off_pairs.back_colour) {
	const saved_fillStyle = ctx.fillStyle;
	//ctx.fillStyle= rnd_pairs.back_colour ? gen_colour() : colours.back_colour;
	ctx.fillStyle= colours.back_colour;
	ctx.fillRect(from_x, from_y, to_x, to_y);
	ctx.fillStyle = saved_fillStyle;
    }
}

function stop() {
    animate = false;
}

function pause() {
    animate=false;
}

function go_on() {
    animate = true;
    animPhase();
}

function col_sel_change(sel_id) {
    const cb = document.getElementById('rnd_' + sel_id);
    const sel = document.getElementById(sel_id);
    sel.disabled = cb.checked ? true : false;
    rnd_pairs[sel_id] = cb.checked ? true : false;
    //console.log(v + " should change to " + (cb.checked ? true : false));
}

function col_off_change(sel_id) {
    const off_cb = document.getElementById(sel_id + "_off");
    const rnd_cb = document.getElementById("rnd_" + sel_id);
    const sel = document.getElementById(sel_id);
    if (off_cb.checked) {
	sel.disabled = true;
	rnd_cb.disabled = true;
	off_pairs[sel_id] = true;
    } else {
	sel.disabled = false;
	rnd_cb.disabled = false;
	off_pairs[sel_id] = false;
    }
    //console.log(v + " should change to " + (cb.checked ? true : false));
}

function animPhase() {
    g.draw(off_pairs,true,false);
    g.calcForces();
    g.step();
    if(!tracer.checked)
	clear_canvas();
    g.draw(off_pairs,false,labelling.checked);
    if (animate)
        setTimeout(animPhase, time_out);
}
