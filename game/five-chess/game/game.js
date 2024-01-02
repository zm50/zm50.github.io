// 棋盘初始化
function initChessBoard(ctx) {
    for (let i = 0; i < 15; i++) {
        chessBoard[i] = []
        for (let j = 0; j < 15; j++) {
            chessBoard[i][j] = 0
        }
    }
    ctx.strokeStyle = "#b9b9b9"
    for (let i = 0; i < 15; i++) {
        //设置水平方向的起始点
        ctx.moveTo(15, 15+i*30)
        //设置水平方向的终止点
        ctx.lineTo(435, 15+i*30)
        //连接水平方向的两点
        ctx.stroke()
        //设置竖直方向的起始点
        ctx.moveTo(15+i*30, 15)
        //设置竖直方向的终止点
        ctx.lineTo(15+i*30, 435)
        //连接竖直方向的两点
        ctx.stroke()
    }
}

// 开局设置
function setStart() {
    playerChess = Math.random() < 0.5 ? 1 : 2
    aiChess = playerChess == 1 ? 2 : 1
    curRole.innerHTML = "黑棋回合"
    let playerChessText = document.getElementById("playerChess")
    if (aiChess == 2) {
        downChess(7, 7, "black")
        playerChessText.innerHTML = "我方执白棋"
    } else {
        playerChessText.innerHTML = "我方执黑棋"
    }
}

// 设置玩家点击事件
function setOnClick() {
    board.onclick = (evt) => {
        if (isOver) {
            alert("游戏已结束")
            return
        }

        let x = Math.floor(evt.offsetX / 30)
        let y = Math.floor(evt.offsetY / 30)
        if (chessBoard[x][y] != 0) {
            return
        }

        downChess(x, y, getChessColor(curChess))

        // ai下棋
        aiDownChess()
    }
}

// 下棋
function downChess(x, y, color) {
    console.log(chessBoard[x][y], curChess)
    chessBoard[x][y] = curChess

    // 画棋
    ctx.beginPath()
    ctx.arc(15+x*30, 15+y*30, 13, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()

    if (checkOver(x, y)) {
        isOver = true
        if (curChess == 1) {
            alert("白棋获胜")
            curRole.innerHTML = "白棋获胜"
            return
        } else {
            alert("黑棋获胜")
            curRole.innerHTML = "黑棋获胜"
            return
        }
    }

    // 更新玩家回合
    if (curChess == 1) {
        curChess = 2
        curRole.innerHTML = "黑棋回合"
    } else {
        curChess = 1
        curRole.innerHTML = "白棋回合"
    }
}

// 检查游戏是否结束
function checkOver(x, y) {
    let count = 0
    let i = 1
    while (i<5&&y>=i&&chessBoard[x][y-i]==curChess) {
        count++
        i++
    }
    i = 1
    while (i<5&&y+i<15&&chessBoard[x][y+i]==curChess) {
        count++
        i++
    }
    if (count > 3) {
        return true
    }
    // |
    count = 0
    i = 1
    while (i<5&&x>=i&&chessBoard[x-i][y]==curChess) {
        count++
        i++
    }
    i = 1
    while (i<5&&x+i<15&&chessBoard[x+i][y]==curChess) {
        count++
        i++
    }
    if (count > 3) {
        return true
    }
    // \
    count = 0
    i = 1
    while (i<5&&x>=i&&y>=i&&chessBoard[x-i][y-i]==curChess) {
        count++
        i++
    }
    i = 1
    while (i<5&&x+i<15&&y+i<15&&chessBoard[x+i][y+i]==curChess) {
        count++
        i++
    }
    if (count > 3) {
        return true
    }
    // /
    count = 0
    i = 1
    while (i<5&&x+i<15&&y>=i&&chessBoard[x+i][y-i]==curChess) {
        count++
        i++
    }
    i = 1
    while (i<5&&x>=i&&y+i<15&&chessBoard[x-i][y+i]==curChess) {
        count++
        i++
    }
    return count > 3
}
