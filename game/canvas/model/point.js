class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    equals(point) {
        return this.x == point.x && this.y == point.y
    }

    distance(point) {
        return Math.hypot(this.x - point.x, this.y - point.y)
    }
    
    draw(ctx, {radius = 9, color = 'black', outline = false, fill = false} = {}) {
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI)
        ctx.fill()
        if (outline) {
            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.strokeStyle = 'yellow'
            ctx.arc(this.x, this.y, radius * 0.6, 0, 2 * Math.PI)
            ctx.stroke()
        }

        if (fill) {
            ctx.beginPath()
            ctx.fillStyle = 'yellow'
            ctx.arc(this.x, this.y, radius * 0.4, 0, 2 * Math.PI)
            ctx.fill()
        }
    }
}
