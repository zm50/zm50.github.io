function flush() {
    if (player.gameIsOver) {
        return
    }
    player.update()
    updateBullet()
    updateRocks()
    requestAnimationFrame(flush)
}