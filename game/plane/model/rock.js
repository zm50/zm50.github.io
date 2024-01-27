class Rock extends Img {
    constructor(imgSrc) {
        super(imgSrc)
        this.img.onload = () => {
            let x = Math.random() * (win.offsetWidth - this.w())
            this.setX(x)
        }

        // 0表示岩石，1表示盾牌，2表示弹药
        this.type = 0

        this.speedX = (Math.random() * 2 * MAX_ROCK_SPEED_X) - MAX_ROCK_SPEED_X
        this.speedY = Math.random() * VAR_ROCK_SPEED_Y + MIN_ROCK_SPEED_Y
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
        if (y > win.offsetHeight - this.h()) {
            if (this.type != 0) {
                this.img.src = randomRockSrc()
                this.type = 0
            }
            this.setY(0)
            return
        }
        this.setY(y)
    }

    init() {
        this.img.src = randomRockSrc()
        this.setY(0)
    }

    move() {
        this.moveX(this.x() + this.speedX)
        this.moveY(this.y() + this.speedY)
    }
}

function randomRockSrc() {
    let index = Math.floor(Math.random() * ROCK_KIND)
    return PERFIX_SRC + index + POSTFIX_ROCK
}

var rocks = new Array()

function updateRocks() {
    for (let i = 0; i < ROCK_COUNT; i++) {
        let rock = rocks[i]
        rock.move()
        if (rock.type == 0) {
            let angle = (rock.angle + 2) % 360
            rock.rotate(angle)
        }
        if (rock.cross(player)) {
            switch (rock.type) {
                // rock
                case 0:
                    player.hp -= ROCK_HURT
                    if (player.hp <= 0) {
                        player.gameOver()
                        return
                    }
                    hp.style.width = player.hp + 'px'
                    break

                // shield
                case 1:
                    player.hp = (player.hp + SHIELD_NUM) % 101
                    hp.style.width = player.hp + 'px'
                    break

                // light
                case 2:
                    player.setScore(player.score() + LIGHT_NUM)
                    break
            }

            rock.init()
        }
    }
}

function initRocks() {
    for (let i = 0; i < ROCK_COUNT; i++) {
        let rock = new Rock(randomRockSrc())
        rocks.push(rock)
    }
}

initRocks()