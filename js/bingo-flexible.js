
$(function() {
    function initGame(board, oldStatus) {
        var board = board
        var gameStatus = []

        // 有舊資料就存入舊資料，否則依照board大小創造空白陣列
        if (oldStatus) {
            gameStatus = oldStatus
        }else {
            var length = Math.pow(board,2)
            for (var n=0; n<length; n++) {
                gameStatus.push(0)
            }
        }

        return {
            update : function(num) {
                let n = num-1
                if (n<Math.pow(board,2)) {
                    gameStatus[n] = 1
                }
            },
            check : function() {
                // 縱向判斷
                for(let n=0; n<board; n++) {
                    let temp=0
                    for(let m=0; m<board; m++) {
                        let x = n
                        let y = m
                        let z = x+(y*board)
                        if(gameStatus[z] == 1) {
                            temp++
                        } 
                        // console.log(`x:${x}, y:${y}`)
                        // console.log(`gameStatus[${z}]`)
                    }
                    if(temp===board){
                        return true
                    }
                }
                // 橫向判斷
                for(let n=0; n<board; n++) {
                    let temp=0
                    for(let m=0; m<board; m++) {
                        let x = m
                        let y = n
                        let z = x + (y*board)
                        if(gameStatus[z] == 1) {
                            temp++
                        } 
                    }
                    if(temp===board){
                        return true
                    }
                }
                // 斜向判斷
                let check_topleft_to_bottomright=0
                let check_topright_to_bottomleft=0
                for(let n=0; n<board; n++) {
                    let x = n
                    let y = n
                    let z = x + (y*board)
                    let Z = ((y+1)*board) - (x+1)
                    if(gameStatus[z] == 1) {
                        check_topleft_to_bottomright++
                    } 
                    if(gameStatus[Z] == 1) {
                        check_topright_to_bottomleft++
                    } 
                    // console.log(`x:${x}, y:${y}`)
                    // console.log(`gameStatus[${Z}]: ${gameStatus[Z]}`)
                }
                if(check_topleft_to_bottomright===board || check_topright_to_bottomleft===board){
                    return true
                }

                // 全部檢驗失敗
                return false
            },
            show : function() {
                // return gameStatus
                for (let n=0; n<board; n++) {
                    let arr=[]
                    for(let m=0; m<board; m++) {
                        let pushTarget = (n*board)+m
                        arr.push(gameStatus[pushTarget])
                    }
                    console.log(arr)
                }
            } 
        }
    }

    // 3x3
    var board = 3
    var oldStatus 

    var game = initGame(board, oldStatus)
    game.update(1)
    game.update(5)
    game.update(8)
    game.update(6)
    game.update(9)
    console.log(game.show())
    console.log(game.check())
})
     
  