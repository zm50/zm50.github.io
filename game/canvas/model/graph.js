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

    removePoint(point) {
        let edges = this.getEdgesWithPoint(point)
        for (let edge of edges) {
            this.removeEdge(edge)
        }
        this.points.splice(this.points.indexOf(point), 1)
    }

    removeEdge(edge) {
        this.edges.splice(this.edges.indexOf(edge), 1)
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

    getEdgesWithPoint(point) {
        let edges = []
        for (let edge of this.edges) {
            if (edge.includes(point)) {
                edges.push(edge)
            }
        }
        return edges
    }

    dispose() {
        this.points.length = 0
        this.edges.length = 0
    }

    draw(ctx) {
        for (let point of this.points) {
            point.draw(ctx)
        }

        for (let edge of this.edges) {
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
    let success = graph.tryAddEdge(new Edge(graph.points[index1], graph.points[index2]))
    if (!success) {
        console.log("add edge fail")
    }
    ctx.clearRect(0, 0, main.width, main.height)
    graph.draw(ctx)
}

function removeRandomPoint() {
    if (graph.points.length == 0) {
        console.log('no points')
        return
    }
    let index = Math.floor(Math.random() * graph.points .length)
    graph.removePoint(graph.points[index])
    ctx.clearRect(0, 0, main.width, main.height)
    graph.draw(ctx)    
}

function removeRandomEdge() {
    if (graph.edges.length == 0) {
        console.log('no edges')
        return
    }
    let index = Math.floor(Math.random() * graph.edges.length)
    graph.removeEdge(graph.edges[index])
    ctx.clearRect(0, 0, main.width, main.height)
    graph.draw(ctx)
}

function removeAll() {
    graph.dispose()
    ctx.clearRect(0, 0, main.width, main.height)
    graph.draw(ctx)
}