class Bullet extends Img {
    constructor(imgSrc, speed) {
        super(imgSrc)
        this.img.onload = () => {
            this.setX(player.x() + player.w() / 2 - this.w() / 2)
            this.setY(player.y())
        }

        this.speed = speed
    }

    move() {
        let y = this.y() - this.speed

        this.setY(y)
    }
}

var bullets = []

function createBullet() {
    let bullet = new Bullet(BULLET_SRC, BULLET_SPEED)
    bullets.push(bullet)
}

function updateBullet() {
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i]
        bullet.move()

        if (bullet.y() < 0) {
            bullet.remove()
            bullets.splice(i, 1)
        }

        crashProcess()
    }
}

function crashProcess() {
    for (let j = 0; j < ROCK_COUNT; j++) {
        let rock = rocks[j]
        if (rock.type != 0) {
            continue
        }
        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i]
            if (bullet.cross(rock)) {
                let randNum = Math.random()
                if (randNum < TOOL_PROBABILITY) {
                    if (randNum < TOOL_PROBABILITY / 2) {
                        rock.img.src = SHIELD_SRC
                        rock.type = 1
                    } else {
                        rock.img.src = LIGHT_SRC
                        rock.type = 2
                    }
                } else {
                    player.setScore(player.score() + 1)
                    bullet.remove()
                    bullets.splice(i, 1)
                    rock.init()
                }
            }
        }
    }
}