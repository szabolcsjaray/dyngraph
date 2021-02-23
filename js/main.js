var g;
var c2d;
var canvas;

function start() {
    c2d = document.getElementById("c").getContext("2d");
    canvas = document.getElementById("c");

    //let ns = [];
    g = new Graph('trygraph');

    /*g.addNode(new Node('na1', 'c', 'black', 100, 100, c2d));
    g.addNode(new Node('na2', 'c', 'black', 200, 200, c2d));
    g.addNode(new Node('na3', 'c', 'black', 300, 100, c2d));
    g.addNode(new Node('na4', 'c', 'black', 100, 300, c2d));*/

    /*g.addLink(0,1);
    g.addLink(0,2);
    g.addLink(0,3);*/
    let num = 100;

    for(let i = 0;i<num;i++) {
        g.addNode(new Node('n'+i, 'c', 'rgb(145, 151, 189)', 'rgb(31, 30, 124)',  Math.random()*800+100, Math.random()*800+100, c2d));
    }

    for(let i = 0;i<num;i++) {
        g.addLink(Math.floor(Math.random()*num), Math.floor(Math.random()*num));
    }

    count = 0;
    animPhase();

}

var count = 0;

function animPhase() {
    count++;
    c2d.fillStyle='black';
    c2d.strokeStyle='gray';
    g.draw(false);
    g.calcForces();
    g.step();
    //c2d.clearRect(0, 0, canvas.width, canvas.height)
    g.draw();
    if(count<2000) {
        setTimeout(animPhase, 10);
    }
}