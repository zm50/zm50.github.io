class Player extends Img {
    constructor(imgSrc, speed) {
        super(imgSrc)
        this.img.onload = () => {
            let x = (win.offsetWidth - this.w()) / 2
            this.setX(x)
            let y = win.offsetHeight - this.h()
            this.setY(y)
        }

        this.gameIsOver = false
        this.hp = 100
        this.speed = speed
        this.controls = new Controls()
    }

    moveX(x) {
        let res
        if (x < -this.w() / 2) {
            res = win.offsetWidth - this.w() / 2
        } else if (x > win.offsetWidth - this.w() / 2) {
            res = -this.w() / 2
        } else {
            res = x
        }
        this.setX(res)
    }

    moveY(y) {
        let res
        if (y < 0) {
            res = 0
        } else if (y > win.offsetHeight - this.h()) {
            res = (win.offsetHeight - this.h())
        } else {
            res = y
        }
        this.setY(res)
    }

    update() {
        this.#move()
    }

    #move() {
        if (this.controls.up) {
            this.moveY(this.y() - this.speed)
        }

        if (this.controls.down) {
            this.moveY(this.y() + this.speed)
        }

        if (this.controls.left) {
            this.moveX(this.x() - this.speed)
        }

        if (this.controls.right) {
            this.moveX(this.x() + this.speed)
        }
    }

    score() {
        return parseInt(score.innerText)
    }

    setScore(number) {
        score.innerText = number
    }

    gameOver() {
        this.gameIsOver = true
        clearInterval(createBulletTimer)
        win.innerHTML = '<p style="color: white; text-align: center;">游戏结束，您的最终得分为：' + this.score() + '</p>'
    }
}