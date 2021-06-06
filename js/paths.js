class BreadthFirstPathsIterative {
    marked;
    edge_to;
    queue;
    source;
    constructor(g,s) {
	this.source = s;
	this.marked = new Array(g.nu_vertices);
	for (let i = 0; i < this.marked.length; ++i)
	    this.marked[i] = false;
	this.marked[this.source] = true;
	this.edge_to = [];
	this.queue = [];
	this.queue.push(this.source);
	this.bfs(g);
    }
    bfs(g) {
	while(this.queue.length > 0) {
	    const vertex = this.queue.shift();
	    const adj = g.adj[vertex];
	    for(let w of adj)
		if (!this.marked[w]) {
		    this.edge_to[w] = vertex;
		    this.marked[w] = true;
		    this.queue.push(w);
		}
	}
    }
    has_path_to(w) { return this.marked[w]; }
    path_to(v) {
	if(!this.has_path_to(v)) return null;
	let path = [];
	for(let x = v; x != this.source; x = this.edge_to[x])
	    path.unshift(x);
	path.unshift(this.source);
	return path;
    }
}
