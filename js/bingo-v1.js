
$(function() {
    function initGame(board, oldStatus) {
        var board = board
        var gameStatus = []

        // 有舊資料就存入舊資料，否則依照board大小創造空白陣列
        if (oldStatus) {
            gameStatus = oldStatus
        }else {
            var length = board*board
            for (var n=0; n<length; n++) {
                gameStatus.push(0)
            }
        }

        return {
            update : function(num) {
                gameStatus[num-1] = 1
                console.log(gameStatus)
            },
            check : function() {
                if (
                    gameStatus[0] + gameStatus[1] + gameStatus[2] === 3 ||
                    gameStatus[3] + gameStatus[4] + gameStatus[5] === 3 ||
                    gameStatus[6] + gameStatus[7] + gameStatus[8] === 3 ||
                    gameStatus[0] + gameStatus[3] + gameStatus[6] === 3 ||
                    gameStatus[1] + gameStatus[4] + gameStatus[7] === 3 ||
                    gameStatus[2] + gameStatus[5] + gameStatus[8] === 3 ||
                    gameStatus[0] + gameStatus[4] + gameStatus[8] === 3 ||
                    gameStatus[2] + gameStatus[4] + gameStatus[6] === 3 
                ){
                    return true
                }else {
                    return false
                }
            },
            show : function() {
                return gameStatus
            }
        }
    }

    // 3x3
    var board = 3
    var oldStatus 

    // var game = initGame([1,1,0,0,0,0,0,0,0])
    var game = initGame(board, oldStatus)
    game.update(4)
    game.update(8)
    game.update(9)
    game.update(5)
    console.log(game.show())
    console.log(game.check())
    game.update(1)
    console.log(game.check())
})
     
  