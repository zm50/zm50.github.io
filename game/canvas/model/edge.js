class Edge {
    constructor(p1, p2) {
        this.p1 = p1
        this.p2 = p2
    }

    equals(edge) {
        return ((this.p1.equals(edge.p1) && this.p2.equals(edge.p2)) || (this.p1.equals(edge.p2) && this.p2.equals(edge.p1)))
    }

    includes(point) {
        return point.equals(this.p1) || point.equals(this.p2)
    }

    draw(ctx, width = 2, color = 'black') {
        ctx.beginPath()
        ctx.lineWidth = width
        ctx.strokeStyle = color
        ctx.moveTo(this.p1.x, this.p1.y)
        ctx.lineTo(this.p2.x, this.p2.y)
        ctx.stroke()
    }
}
