class Graph {
    constructor(points = [], edges = []) {
        this.points = points
        this.edges = edges
    }

    addPoint(point) {
        this.points.push(point)
    }

    addEdge(edge) {
        this.edges.push(edge)
    }

    containPoint(point) {
        return this.points.find((p) => p.equals(point))
    }

    containEdge(edge) {
        return this.edges.find((e) => e.equals(edge))
    }

    tryAddPoint(point) {
        if (this.containPoint(point)) {
            return false
        }
        this.addPoint(point)
        return true
    }

    tryAddEdge(edge) {
        if (edge.p1.equals(edge.p2) || this.containEdge(edge)) {
            return false
        }
        this.addEdge(edge)
        return true
    }

    draw(ctx) {
        for (const point of this.points) {
            point.draw(ctx)
        }

        for (const edge of this.edges) {
            edge.draw(ctx)
        }
    }
}

function addRandomPoint() {
    let success = graph.tryAddPoint(new Point(Math.random() * main.width, Math.random() * main.height))
    if (!success) {
        console.log("add point fail")
    }
    ctx.clearRect(0, 0, main.width, main.height)
    graph.draw(ctx)
}

function addRandomEdge() {
    let index1 = Math.floor(Math.random() * graph.points.length)
    let index2 = Math.floor(Math.random() * graph.points.length)
    let p1 = graph.points[index1]
    let p2 = graph.points[index2]
    let success = graph.tryAddEdge(new Edge(p1,p2))
    if (!success) {
        console.log("add edge fail")
    }
    ctx.clearRect(0, 0, main.width, main.height)
    graph.draw(ctx)
}