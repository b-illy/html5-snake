window.onload = () => {
    /* initial declarations */
    const highScore = "snake_high_score"; // local storage item name for high score
    const snakeColor = "#00dd22";
    const fruitColor = "#ff0000";
    const gridSize = {"x": 15, "y": 15}; // the canvas is divided into smaller blocks
    const fps = 10; // gameticks (canvas updates) per second
    
    let score = 0; // starting score
    let head = {"x": 0, "y": 0}; // front tile of the snake
    let tail = []; // array containing each block of the snake's tail
    let speed = {"x": 0, "y": 0}; // movement speed of the snake (head) in each direction
    let speedBuffer = {"x": 0, "y": 0} // only updated every frame to prevent multiple inputs per frame
    let fruit = {"x": 0, "y": 0}; // the fruit to collect to increase score and tail length
    
    function startGame() {
        score = 5;
        head = {"x": Math.floor(gridSize.x/2), "y": Math.floor(gridSize.y/2)};
        tail = [];
        speed = {"x": 0, "y": 0};
        speedBuffer = {"x": 0, "y": 0};
        regenFruit();
    }
    
    function regenFruit() {
        let x = 0, y = 0;
        for (let i = 0; i < 20; i++) { // only try 20 times to avoid lag / infinite loops
            x = Math.round(Math.random() * (gridSize.x-1));
            y = Math.round(Math.random() * (gridSize.y-1));
            let underTail = false; // i like this video game =3
            for (let j = 0; j < tail.length; j++) {
                if (tail[j].x == x && tail[j].y == y) {
                    underTail = true;
                    break;
                }
            }
            if (!underTail && !(head.x == x && head.y == y)) {
                break;
            }
        }
        fruit.x = x;
        fruit.y = y;
    }
    
    function drawTile(x, y, color, border=0) {
        if (x < 0 || x > gridSize.x || y < 0 || y > gridSize.y) return;
        let a = c.width/gridSize.x;
        let b = c.height/gridSize.y;

        ctx.fillStyle = color;
        ctx.fillRect((a*x)+border, (b*y)+border, a-(2*border), b-(2*border));
    }


    /* local storage handling */

    if (!localStorage.getItem(highScore)) { // if no high score is stored
        localStorage.setItem(highScore, 0); // create filler high score
    }

    document.getElementById("reset").addEventListener("click", () => { // reset high score button click event
        localStorage.setItem(highScore, 0); // reset stored high score
    });


    /* main init */

    let c = document.getElementById("canvas");
    let ctx = c.getContext("2d");
    startGame();
    document.addEventListener("keydown", keydown); // create input listener 
    setInterval(gameTick, 1000/fps); // run game tick fps times per second


    /* main game loop */

    function gameTick() {
        // update speed to speedBuffer (modified by user input to make sure speed doesn't change mid-frame
        speed.x = speedBuffer.x;
        speed.y = speedBuffer.y;
        
        // check if high score beaten and update if necessary
        if (score > localStorage.getItem(highScore)) {
            localStorage.setItem(highScore, score); // update high score if necessary
        }

        // update score display
        document.getElementById("score").innerHTML = `Score: ${score}<br>High Score: ${localStorage.getItem(highScore)}`;

        // draw background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, c.width, c.height);
        
        // move the snake
        head.x += speed.x;
        head.y += speed.y;
        
        // detect if snake moved off screen
        if (head.x < 0 || head.x >= gridSize.x || head.y < 0 || head.y >= gridSize.y) {
            startGame();
            return;
        }

        // detect if head is touching tail
        for (let i = 0; i < tail.length; i++) {
            if (head.x == tail[i].x && head.y == tail[i].y) {
                startGame();
                return;
            }
        }
        
        // prevent tail from growing while not moving and score hasn't increased
        if (!(speed.x == 0 && speed.y == 0)) {
            tail.push({"x": head.x-speed.x, "y": head.y-speed.y}); // add last frame's head pos to tail
            if (score <= tail.length) {
                tail.splice(0, 1); // remove last block of tail
            }
        }
        
        // detect if player has eaten fruit
        if (head.x == fruit.x && head.y == fruit.y) { // detect if player has eaten fruit
            regenFruit();
            score += 1;
        }
        
        // draw snake
        drawTile(head.x, head.y, snakeColor, -2);
        for (let i = 0; i < tail.length; i++) {
            drawTile(tail[i].x, tail[i].y, snakeColor, 0);
        }
        
        // draw fruit (note: fruit drawn on top of player in case it generates in tail)
        drawTile(fruit.x, fruit.y, fruitColor, 4);
    }


    /* input handling */

    function keydown(event) { // note: inputs only modify speedBuffer, speed is updated every frame
        let x = 0, y = 0;

        switch (event.key) {
            case "ArrowLeft": case "a": // left
                x = -1;
                break;
            case "ArrowUp": case "w": // up
                y = -1;
                break;
            case "ArrowRight": case "d": // right
                x = 1;
                break;
            case "ArrowDown": case "s": // down
                y = 1;
                break;
        }

        // dont allow player to turn backwards
        if (!(x == 0 && y == 0) && !((x != 0 && x == -speed.x) || (y != 0 && y == -speed.y))) { //
            speedBuffer.x = x;
            speedBuffer.y = y;
        }
    }
}
