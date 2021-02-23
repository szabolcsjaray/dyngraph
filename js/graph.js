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

    draw(setColor = true) {
        this.ns.forEach( node => {
            node.draw(setColor);
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
}