class GraphEditor {
    constructor(win, graph) {
        this.win = win
        this.ctx = win.getContext('2d')
        this.graph = graph
        this.mouse = null
        this.hovered = null
        this.selected = null
        this.dragging = false
        this.#addEventListeners(win)
    }

    #addEventListeners() {
        this.win.addEventListener('mousedown', evt => {
            if (evt.button == 1) {//中键
                if (this.hovered && !(this.selected && this.graph.removeEdge(new Edge(this.selected, this.hovered)))) {
                    this.graph.removePoint(this.hovered)
                    this.hovered = null
                }
                this.selected = null
            } else if (evt.button == 0) {//左键
                if (!this.hovered) {
                    this.graph.addPoint(this.mouse)
                    this.hovered = this.mouse
                }
                if(this.selected) {
                    this.graph.addEdge(new Edge(this.hovered, this.selected))
                }
                this.selected = this.hovered
                this.dragging = true
            }
        })
        this.win.addEventListener('mouseup', () => this.dragging = false)
        this.win.addEventListener('mousemove', evt => {
            this.mouse = new Point(evt.offsetX, evt.offsetY)
            if (this.dragging && this.hovered) {
                this.hovered.x = this.mouse.x
                this.hovered.y = this.mouse.y
            } else {
                this.hovered = getNearestPoint(this.mouse, this.graph.points, 10)
            }
        })
    }

    display() {
        this.graph.draw(this.ctx)
        if (this.hovered) {
            this.hovered.draw(this.ctx, {fill:true})
        }
        if (this.selected) {
            new Edge(this.selected, this.hovered ? this.hovered : this.mouse).draw(ctx, {dash: [3, 3]})
            this.selected.draw(this.ctx, {outline:true})
        }
    }

    flush() {
        this.ctx.clearRect(0, 0, this.win.width, this.win.height)
        this.graph.draw(ctx)
    }
}

function removeAll() {
    graphEditor.graph.dispose()
    graphEditor.selected = null
    graphEditor.hovered = null
    graphEditor.flush()
}