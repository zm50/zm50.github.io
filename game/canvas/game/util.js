function getNearestPoint(point, points, threshould = Number.MAX_SAFE_INTEGER) {
    let minDist = threshould
    let nearest = null
    for (let p of points) {
        let dist = point.distance(p)
        if (dist < minDist && dist < threshould) {
            minDist = dist
            nearest = p
        }
    }
    return nearest
}