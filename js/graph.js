class Graph {
    constructor(name) {
        this.name = name;
        this.ns = [];
    }

    addNode(node) {
        this.ns.push(node);
        return this.ns.length-1;
    }

    addLink(index1, index2) {
        if (index1<0 || index1>=this.ns.length || index2<0 || index2>=this.ns.length)
            return;

        this.ns[index1].addLink(this.ns[index2]);
    }

    draw(setLineColour = true, setOutlineColour = true, setFillColour = true) {
	//console.log("graph.draw() has been called");
        this.ns.forEach( node => {
            node.draw(setLineColour,setOutlineColour,setFillColour);
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

    step() {
        this.calcForces();
        this.ns.forEach( node => {
            node.step();
        });
    }

    get_edge_list() {
	let output_string = "";
	for(let i in this.ns) {
	    if (this.ns[i].links.length == 0) {
		output_string = output_string + this.ns[i].name + "\n";
		//console.log(output_string);
	    } else {
		for(let j in this.ns[i].links) {
		    output_string = output_string + this.ns[i].name + " " + this.ns[i].links[j].name + "\n";
		    //console.log(output_string);
		}
	    }
	}
	return output_string;
    }
}
