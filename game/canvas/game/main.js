main.width = 600
main.height = 600
let p1 = new Point(300, 200)
let p2 = new Point(200, 400)
let p3 = new Point(400, 400)
let edge1 = new Edge(p1, p2)
let edge2 = new Edge(p1, p3)
let edge3 = new Edge(p2, p3)
var graph = new Graph([p1,p2,p3], [edge1,edge2,edge3])
graph.draw(ctx)