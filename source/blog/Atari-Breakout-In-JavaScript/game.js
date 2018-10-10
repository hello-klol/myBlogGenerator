var canvas = document.getElementById("gameCanvas")
var ctx = canvas.getContext("2d")

var score = 0
var lives = 3
var gameOver = false

const ballRadius = 10
var ballX, ballY, dx, dy

const paddleHeight = 10
const paddleWidth = 75
var paddleX = (canvas.width-paddleWidth)/2

var rightPressed = false
var leftPressed = false

const brickRowCount = 3
const brickColumnCount = 5
const brickWidth = 75
const brickHeight = 20
const brickPadding = 10
const brickOffsetTop = 30
const brickOffsetLeft = 30

const Brick = (c, r) => ({
  alive: true,
  x: (c*(brickWidth+brickPadding))+brickOffsetLeft,
  y: (r*(brickHeight+brickPadding))+brickOffsetTop
})

const array = length => Array.from({length})

var bricks = array(brickColumnCount)
  .map((_, c) =>
    array(brickRowCount)
      .map((_, r) => 
        Brick(c, r) 
      )
  )

function* getBrick() {
  for(var c=0; c<brickColumnCount; c++) {
    for(var r=0; r<brickRowCount; r++) {
      yield bricks[c][r]
    }
  }
}

function initialState() {
  ballX = canvas.width/2
  ballY = canvas.height-30
  dx = 3
  dy = -3
}

function drawScore() {
  ctx.font = "16px monospace"
  ctx.fillStyle = "#0095DD"
  ctx.fillText("Score: "+score, 8, 20)
}

function drawLives() {
  ctx.font = "16px monospace"
  ctx.fillStyle = "#0095DD"
  ctx.fillText("Lives: "+lives, canvas.width-85, 20)
}

function drawMessage(msg) {
  ctx.font = "18px monospace"
  ctx.fillStyle = "#0095DD"
  ctx.fillText(msg, (canvas.width/2)-(msg.length*6), canvas.height/2)
}

function drawBall() {
  ctx.beginPath()
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2)
  ctx.fillStyle = "#0095DD"
  ctx.fill()
  ctx.closePath()
}

function drawPaddle() {
  ctx.beginPath()
  ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight)
  ctx.fillStyle = "#0095DD"
  ctx.fill()
  ctx.closePath()
}

function drawBricks() {
  for(let b of getBrick()) {
    if (!b.alive) { continue }
    ctx.beginPath()
    ctx.rect(b.x, b.y, brickWidth, brickHeight)
    ctx.fillStyle = "#0095DD"
    ctx.fill()
    ctx.closePath()
  }
}

function draw() {
  if (gameOver) { return }
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBall()
  drawPaddle()
  drawScore()
  drawLives()
  collisionDetection()
  drawBricks()

  if(ballX + dx > canvas.width-ballRadius || ballX + dx < ballRadius) {
    dx = -dx
  }

  if(ballY + dy < ballRadius) {
      dy = -dy
  } 
  else if(ballY + dy > canvas.height-ballRadius) {
    if(ballX > paddleX && ballX < paddleX + paddleWidth) {
      dy = -dy
    }
    else {
      loseLife()
      initialState()
    }
  }

  ballX += dx
  ballY += dy

  if(rightPressed && paddleX < canvas.width-paddleWidth) {
    paddleX += 7
  }
  else if(leftPressed && paddleX > 0) {
    paddleX -= 7
  }
  requestAnimationFrame(draw)
}

function loseLife() {
  lives--
  if(lives){ return }
  gameOver = true
  finalScreen("GAME OVER")
}

function checkForWin() {
  if(score == brickRowCount*brickColumnCount) {
    gameOver = true
    finalScreen("YOU WIN, CONGRATULATIONS!")
  }
}

function finalScreen(msg) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawScore()
  drawLives()
  drawMessage(msg)
}

function ballHitBrick(b) {
  return (
    ballX > b.x && 
    ballX < b.x+brickWidth && 
    ballY > b.y && 
    ballY < b.y+brickHeight
  )
}

function collisionDetection() {
  for(let b of getBrick()) {
    if (!b.alive) { continue }
    else if(ballHitBrick(b)) {
      dy = -dy
      b.alive = false
      score++
      checkForWin()
    }
  }
}


function keyDownHandler(e) {
  if(e.keyCode == 39) {
    rightPressed = true
  }
  else if(e.keyCode == 37) {
    leftPressed = true
  }
}

function keyUpHandler(e) {
  if(e.keyCode == 39) {
    rightPressed = false
  }
  else if(e.keyCode == 37) {
    leftPressed = false
  }
}

function splashIO(e) {
  if(e.type === "click" || (e.type === "keydown" && e.code === "Enter")){
    canvas.removeEventListener("click",splashIO);
    canvas.removeEventListener("keydown",splashIO);
    gameStates.startGame();
  }
}

const gameStates = {
  setupSplash () { // setup splash screen ==========================
    canvas.addEventListener("click", splashIO)
    canvas.addEventListener("keydown", splashIO)
    gameStates.splash() 
  },
  splash () {  // display splash ===================================
    msg = "Click on the canvas to begin"
    drawMessage(msg)
  },
  startGame () { // setup game =====================================
    initialState()
    document.addEventListener("keydown", keyDownHandler, false)
    document.addEventListener("keyup", keyUpHandler, false)
    gameStates.game();  
  },
  game () {  // plays the main game  ===============================
    draw()
  }
}

gameStates.setupSplash()
