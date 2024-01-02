class Controls {
    constructor() {
        this.up = false
        this.down = false
        this.left = false
        this.right = false
        document.onkeydown = (evt) => {
            this.#onkey(evt, true)
        }
        document.onkeyup = (evt) => {
            this.#onkey(evt, false)
        }
    }

    #onkey(evt, bool) {
        switch (evt.code) {
            case 'KeyW':
                this.up = bool
                break
            case "KeyS":
                this.down = bool
                break
            case "KeyA":
                this.left = bool
                break
            case "KeyD":
                this.right = bool
                break
        }
    }
}

