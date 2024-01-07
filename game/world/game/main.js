main.width = 600
main.height = 600
let p1 = new Point(300, 300)
let p2 = new Point(200, 300)
let p3 = new Point(400, 500)
let p4 = new Point(300, 500)
let edge1 = new Edge(p1, p2)
let edge2 = new Edge(p1, p3)
let edge3 = new Edge(p1, p4)
var graph = new Graph([p1,p2,p3,p4], [edge1,edge2,edge3])
graph.draw(ctx)