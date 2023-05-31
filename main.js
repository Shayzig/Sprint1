
// Have a bug on onCellMarked function (130) - cant win (count correct)

//-----------------Global-------------------
// var hideContextMenu =  window.addEventListener("contextmenu", e => e.preventDefault());
var gBoard
var gLevel = {
    size: 4,
    mine: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secPassed: 0,
    
}
var gIsMarked = false
var timerInterval

// ----- check why dont work!!!
// const MINE = 'X'
// const MARKED = '!'


//------------------------Start--------------------------
function chooseDif(diff) {
    gLevel.size = diff
    gLevel.mine = Math.floor((diff**2) / 3)
    onInit() 
}

//---------------foundtion-------------------------------

function onInit() {
    gBoard = buildBoard(gLevel.size)
    // addRandomMines(gBoard) // Working func - meanwhile use SetMines
    setMines(gBoard)
    setMinesNegsCount(gBoard) // Update how many mines any cell have
    renderBoard(gBoard)
    rightClick() // activate the right click and return elCell 
    clearInterval(timerInterval)
    clearTimer()
    gGame.shownCount = 0
    gGame.isMarked = 0
    
}

function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                content: '',
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            var className = `cell cell-${i}-${j}`
            strHTML += `
     <td title="${i},${j}" onclick="onCellClicked(${i},${j},this)" class="${className}">${cell.content}</td>`
        }
        strHTML += '</tr>'
    }

    document.querySelector('table').innerHTML = strHTML
}


//---------------------Actions--------------------------
function onCellClicked(i, j, elCell) {
    cell = gBoard[i][j]

    if(gGame.shownCount === 0) {
        startTimer()
    }
   
    if (cell.isMine) {   // step on mine
        elCell.innerText = 'X'
        // gGame.isOn = false
        return gameOver('You Lost!')
    }

    var minesAroundCell = countMinesAround(gBoard, i, j) // return number of mines
    if (minesAroundCell === 0) {
        expandShown(gBoard, i, j, elCell)
    }

    //update the model
    if (!cell.isShown) {
        cell.content = minesAroundCell
        cell.isShown = true
        gGame.shownCount++
        console.log(gGame.shownCount)

        //update the DOM (reveal)
        elCell.innerText = minesAroundCell
        // renderBoard(gBoard)
    }
    checkGameOver()
}

function rightClick() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {

            const element = document.querySelector(`.cell-${i}-${j}`)
            element.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                onCellMarked(this)
            });
        }
    }
}

function onCellMarked(elCell) {
    var pos = getPos(elCell) // return [cell,i,j]

    if(gGame.markedCount === 0) startTimer()

    switch (gIsMarked) {
        case true:
            gBoard[pos[1]][pos[2]].isMarked = false
            elCell.innerText = ''
            gIsMarked = false
            gGame.markedCount--
            console.log(gGame.markedCount)
            break;
    
            case false:
                gBoard[pos[1]][pos[2]].isMarked = true
                gGame.markedCount++
                console.log(gGame.markedCount)
                elCell.innerText = '!'
                gIsMarked = true
                checkGameOver()
            break;
    }
}

function expandShown(board, rowIdx, colIdx, elCell) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue


            //Model
            var cell = gBoard[i][j]
            if (!cell.isShown) {
                cell.isShown = true
                gGame.shownCount++
            }

            ///DOM
            var mineNegs = countMinesAround(gBoard, i, j)
            elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.innerText = mineNegs
        }
    }
    console.log(gGame.shownCount)
}


//-----------------------Mines----------------------------
function setMines(board) {
    // gBoard[0][1].content = MINE
    board[0][1].isMine = true

    // gBoard[1][1].content = MINE
    board[2][3].isMine = true
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            // console.log('i:', i , 'j:', j)
            var mineNegs = countMinesAround(gBoard, i, j)
            // console.log('i:', i , 'j:', j , 'mineNegs:' ,mineNegs)
            cell.minesAroundCount = mineNegs
            // cell.content = mineNegs
            // if (cell.isMine) cell.content = MINE
        }
    }
}

function countMinesAround(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue

            var cell = board[i][j]
            if (cell.isMine) count++
        }
    }
    return count
}

//use it later!
function addRandomMines() {
    for (var i = 0; i <= gLevel.mine; i++) {
        const emptyPos = getEmptyPos(gBoard)
        if (!emptyPos) return

        //model
        gBoard[emptyPos.i][emptyPos.j].isMine = true
    }
}


//-------------------CHECKS--------------------------------
function checkGameOver() {
    if (gGame.shownCount === (gLevel.size ** 2) - gLevel.mine && gGame.markedCount === gLevel.mine) {
        gameOver('You Win!')
    }
}

function gameOver(msg) {
    clearInterval(timerInterval)
    clearTimer()
    gGame.shownCount = 0
    gGame.isMarked = 0
    openModal(msg)
}

function getPos(element) {
    // console.log('element', element)
    // var res = []
    var str = element.classList[1]
    // console.log('str', str)
    var locationArray = str.split('-')
    // console.log('locationArray', locationArray)
    return locationArray

}



