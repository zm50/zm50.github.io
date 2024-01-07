class Graph {
    constructor(points = [], edges = []) {
        this.points = points
        this.edges = edges
    }

    containPoint(point) {
        return this.points.find((p) => p.equals(point))
    }

    containEdge(edge) {
        return this.edges.find((e) => e.equals(edge))
    }

    addPoint(point) {
        if (this.containPoint(point)) {
            return false
        }
        this.points.push(point)
        return true
    }

    addEdge(edge) {
        if (edge.p1.equals(edge.p2) || this.containEdge(edge)) {
            return false
        }
        this.edges.push(edge)
        return true
    }

    removePoint(point) {
        if (!this.containPoint(point)) {
            return false
        }
        let edges = this.getEdgesWithPoint(point)
        for (let edge of edges) {
            this.removeEdge(edge)
        }
        this.points.splice(this.points.indexOf(point), 1)
        return true
    }

    removeEdge(edge) {
        if (!this.containEdge(edge)) {
            return false
        }
        this.edges.splice(this.edges.indexOf(edge), 1)
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