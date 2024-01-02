var board = document.getElementById('board')
var ctx = board.getContext('2d')
var curRole = document.getElementById("curRole")
var restart = document.getElementById("restart")
// 1:白棋,2:黑棋,other:空
var chessBoard = []
//当前下棋的棋子类型1:白棋,2:黑棋
var curChess = 2
//当前玩家的棋子类型1:白棋,2:黑棋
var playerChess = 0
//当前ai的棋子类型1:白棋,2:黑棋
var aiChess = 0
//游戏是否结束
var isOver = false
