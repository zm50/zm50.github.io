let p1 = new Point(350, 200)
let p2 = new Point(250, 400)
let p3 = new Point(450, 400)
let edge1 = new Edge(p1, p2)
let edge2 = new Edge(p1, p3)
let edge3 = new Edge(p2, p3)
var graphEditor = new GraphEditor(win, new Graph([p1,p2,p3], [edge1,edge2,edge3]))

flush()
function flush() {
    ctx.clearRect(0, 0, win.width, win.height)
    graphEditor.display()
    requestAnimationFrame(flush)
}