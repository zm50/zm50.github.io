class Img {
    constructor(src) {
        this.img = document.createElement('img')
        this.img.src = src
        this.img.style.position = 'absolute'
        this.img.style.left = '0px'
        this.img.style.top = '0px'
        this.angle = 0
        win.appendChild(this.img)
    }

    x() {
        return parseInt(this.img.style.left)
    }

    y() {
        return parseInt(this.img.style.top)
    }

    w() {
        return this.img.width
    }

    h() {
        return this.img.height
    }

    right() {
        return this.x() + this.w()
    }

    bottom() {
        return this.y() + this.h()
    }

    setX(x) {
        this.img.style.left = x + 'px'
    }

    setY(y) {
        this.img.style.top = y + 'px'
    }

    remove() {
        win.removeChild(this.img)
    }

    rotate(angle) {
        this.angle = angle
        this.img.style.transform = 'rotate(' + angle + 'deg)'
    }

    contain(img) {
        return this.x() <= img.x() &&
        this.x() + this.w() >= img.x() + img.w() &&
        this.y() <= img.y() &&
        this.y() + this.h() >= img.y() + img.h()
    }

    cross(img) {
        return this.x() < img.x() + img.w() &&
        this.x() + this.w() > img.x() &&
        this.y() < img.y() + img.h() &&
        this.y() + this.h() > img.y()
    }
}