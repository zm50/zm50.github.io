// ai下棋
function aiDownChess() {
    let tmp = calculate()
    let x = tmp[0]
    let y = tmp[1]
    downChess(x, y, getChessColor(curChess))
}

// 计算棋盘中得分最高的点
function calculate() {
    let maxScore = 0
    let curScore = 0
    let i = 0
    let j = 0
    let x = 0
    let y = 0

    while (i < 15) {
        j = 0
        while (j < 15) {
            curScore = 0
            // 判断该点是否可以落子
            if (chessBoard[i][j] != 0) {
                j++
                continue
            }

            curScore += calculateDirection(1, 0, i, j) + calculateDirection(0, 1, i, j) + calculateDirection(-1, 1, i, j) + calculateDirection(1, 1, i, j)
            if (curScore > maxScore) {
                maxScore = curScore
                x = i
                y = j
            }
            j++
        }
        i++
    }
    return [x, y]
}

// 计算某个方向一半的得分情况
function calculateHalfDirection(i, j, y, x, chess, forward) {
    let num = 0
    let otherChess = chess == 1 ? 2 : 1
    for (let k = 1; k < 5; k++) {
        let offsetX = x + forward * (i * k)
        let offsetY = y + forward * (j * k)
        if (offsetX < 0 || offsetX > 14 || offsetY < 0 || offsetY > 14) {
            return [num, 1]
        }
        switch (chessBoard[offsetY][offsetX]) {
            case chess:
            num++
            break
            case otherChess:
            return [num, 1]
            default:
            return [num, 0]
        }
    }

    return [num, 0]
}

// 计算某个方向的得分
function calculateDirection(i, j, y, x) {
    // 正向计算player棋子状况
    let tmp = calculateHalfDirection(i, j, y, x, playerChess, 1)
    let playerNum = tmp[0]
    let playerLive = tmp[1]

    // 反向计算player棋子状况
    tmp = calculateHalfDirection(i, j, y, x, playerChess, -1)
    playerNum += tmp[0]
    playerLive += tmp[1]


    // 正向计算ai棋子状况
    tmp = calculateHalfDirection(i, j, y, x, aiChess, 1)
    let aiNum = tmp[0]
    let aiLive = tmp[1]

    // 反向计算ai棋子状况
    tmp = calculateHalfDirection(i, j, y, x, aiChess, -1)
    aiNum = tmp[0]
    aiLive = tmp[1]

    console.log(i, j, y, x, playerNum, aiNum, playerLive, aiLive)

    if (playerChess == 1) {
        // 玩家是白棋
        return calculateScore(playerNum, aiNum, playerLive, aiLive)
    } else {
        // 玩家是黑棋
        return calculateScore(aiNum, playerNum, aiLive, playerLive)
    }
}

// 计算该点的得分情况
function calculateScore(whiteNum, blackNum, whiteChessIsConnect, blackChessIsConnect) {
	let score = 0
    // 计算白棋得分
	if (whiteChessIsConnect < 2) {
		switch (whiteNum) {
		case 0:
        break
		case 1:
			if (whiteChessIsConnect==0) {
				score += 10
			}
        break
		case 2:
			if (whiteChessIsConnect==0) {
				score += 50
			} else {
				score += 25
			}
        break
		case 3:
			if (whiteChessIsConnect==0) {
				score += 10000
			} else {
				score += 55
			}
	    break
    	default:
			score += 30000
		}
	}

	// 计算黑棋得分
	if (blackChessIsConnect < 2) {
		switch (blackNum) {
		case 0:
        break
		case 1:
			if (blackChessIsConnect==0) {
				score += 10
			}
            break
		case 2:
			if (blackChessIsConnect==0) {
				score += 40
			} else {
				score += 30
			}
            break
		case 3:
			if (blackChessIsConnect==0) {
				score += 200
			} else {
				score += 60
			}
            break
		default:
			score += 20000
		}
	}
	return score
}
