class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    equals(point) {
        return this.x == point.x && this.y == point.y
    }
    
    draw(ctx, radius = 9, color = 'black') {
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI)
        ctx.fill()
    }
}
