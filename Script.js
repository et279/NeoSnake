// HTML Elements
const display = document.getElementById('display');
const scoredisplay = document.getElementById('scoredisplay');
const startButton = document.getElementById('start');
const gameOverDiv = document.getElementById('gameOver');
const gamePauseDiv = document.getElementById('gamePause');

// Game settings
const DISPLAY_SIZE = 10;
const gameSpeedinicial = 500;
let gameSpeed;
const SQUARE_TYPES = {
    EMPTY_SQUARE: 'emptySquare',
    SNAKE_SQUARE: 'snakeSquare',
    SNAKE_HEAD_SQUARE: 'snakeSquare snakeHeadSquare',
    FOOD_SQUARE: 'foodSquare',
    VENOM_SQUARE: 'venomSquare',
    SLOW_SQUARE: 'slowSquare',
};
const DIRECTIONS = {
    ARROW_UP: -10,
    ARROW_DOWN: 10,
    ARROW_LEFT: -1,
    ARROW_RIGHT: 1,
};

// Game variables
let foodSquares;
let venomContadorTimer = 0;
let venomSquares;
let slowContadorTimer = 0;
let slowSquares;
let snake;
let score=0;
let direction = 'ARROW_RIGHT';
let directionold;
let displaySquares;
let emptySquares;
let moveInterval;
let pause = 0;
let pauseerror=0;

////////////////////////////////////////////////////////
///////////////////////  Logica  ///////////////////////
////////////////////////////////////////////////////////
const gameLogic = {
    // Ejecucion por frame
    update(){
        //comprueba que no este pausado
        if(pause==1){
            return;
        }
        const newSquare = utils.searchSquare(direction,snake[snake.length - 1])
        const [row, column] = newSquare.split('');
        this.controlVenom();
        // Comprueba si la serpiente choca con algo
        if (
            newSquare < 0 ||
            newSquare > DISPLAY_SIZE * DISPLAY_SIZE ||
            (direction === DIRECTIONS.ARROW_RIGHT && column == 0) ||
            (direction === DIRECTIONS.ARROW_LEFT && column == 9) ||
            snake.includes(newSquare)
        ) {
            console.log("¡Chocaste!");
            gameOver();
            return;
        }

        // Agrega el nuevo cuadrado a la serpiente
        snake.push(newSquare);
        
        // Si la serpiente come una comida
        //console.log(foodSquares,'=',newSquare);
        if (foodSquares.includes(newSquare)) {
            console.log("¡Comida!");
            addFood();
            return;
        }

        // Si la serpiente pisa una casilla de muerte
        if (venomSquares.includes(newSquare)) {
            console.log("¡Casilla de veneno!");
            venomSnake();
            setTimeout(venomSquares = [],utils.getRandomInt(200,1000));
            return;
        }

        // Si la serpiente pisa una casilla de lentitud
        if (slowSquares.includes(newSquare)) {
            console.log("¡Casilla de lentitud!");
            slowSnake();
            setTimeout(slowSquares = [],utils.getRandomInt(200,1000));
            return;
        }

        // Mueve la serpiente
        const emptySquare = snake.shift();
        //console.log('cola '+emptySquare+' - cabeza nueva '+newSquare);
        drawer.drawSquare(emptySquare, SQUARE_TYPES.EMPTY_SQUARE);
        drawer.drawSquare(snake[snake.length-2],SQUARE_TYPES.SNAKE_SQUARE);
        drawer.drawSquare(newSquare, SQUARE_TYPES.SNAKE_HEAD_SQUARE);
        drawer.headDirection(snake[snake.length-2],newSquare,direction);
    },

    // Cambia la dirección de la serpiente
    setDirection(newDirection) {
        // se comprueba que el proximo movimiento no sea encontra de la direccion actual
        if (
            (direction === DIRECTIONS.ARROW_UP && newDirection === DIRECTIONS.ARROW_DOWN) ||
            (direction === DIRECTIONS.ARROW_DOWN && newDirection === DIRECTIONS.ARROW_UP) ||
            (direction === DIRECTIONS.ARROW_LEFT && newDirection === DIRECTIONS.ARROW_RIGHT) ||
            (direction === DIRECTIONS.ARROW_RIGHT && newDirection === DIRECTIONS.ARROW_LEFT)
            ) {
                //console.log('entro al error de direccion opuesta ');
                return;
            }
        // se comprueba que no exista un error de cambio de movimiento dos veces antes de que la culebra se mueva y proboque que se estrelle
        const squareSearch = utils.searchSquare(newDirection,snake[snake.length - 1]);
        if(snake[snake.length - 2]=== squareSearch){
            //console.log('se genero un error  en el movimiento');
            newDirection = directionold.pop();
            //console.log('pero se soluciono corrigiendo ',newDirection,' por ',direction);           
            ;
        }
        // evita guardar movimientos mientras este en pausa
        if(pause===1){
            return;
        }
        direction = newDirection;
        directionold.push(direction);
        console.log('direccion: ', direction);
    },

    // Controlador veneno
    controlVenom() {
        //console.log('entro al controlador de veneno');
        if(utils.getRandomInt(0,30)==0 && snake.length>8 && venomSquares.length==0){
            utils.createRandomvenom();
            console.log('Creao veneno en', venomSquares[0]);
        }else if(venomSquares.length>0 && venomContadorTimer>0){
            venomContadorTimer--;
            //console.log(venomContadorTimer);
        }else if(venomContadorTimer==0 && venomSquares.length>0){
            console.log('va eliminar veneno por no uso ', venomSquares[0]);
            drawer.cleanSquare(venomSquares[0]);
            venomSquares=[];
        }
    }


}
///////////////////////////////////////////////////////
///////////////////  Zona de dibujo  //////////////////
///////////////////////////////////////////////////////
const drawer = {
    // Dibujar display
    createdisplay() {
        displaySquares.forEach( (row, rowIndex) => {
            row.forEach( (column, columnndex) => {
                const squareValue = `${rowIndex}${columnndex}`;
                const squareElement = document.createElement('div');
                squareElement.setAttribute('class', 'square emptySquare');
                squareElement.setAttribute('id', squareValue);
                display.appendChild(squareElement);
                emptySquares.push(squareValue);
            })
        })
    },

    // Dibujar Serpiente
    drawSnake() {
        for(i=0,j=snake.length-1; i<j; i++){
            //console.log(snake[i]);
            drawer.drawSquare(snake[i], 'snakeSquare');
        };
        drawer.drawSquare(snake[snake.length-1], 'snakeSquare snakeHeadSquare');
        drawer.headDirection(snake[snake.length-2],snake[snake.length-1],direction);
    },

    // Dibujar cuadrado
    // square: posicion del cuadrado
    // type: tipo de cuadrado (emptySquare, snakeSquare, foodSquare, venomSquare, slowSquare)
    drawSquare(square, type){
        //console.log('Pintando '+square + " - " + type);
        const [ row, column ] = square.split('');
        displaySquares[row][column] = SQUARE_TYPES[type];
        const squareElement = document.getElementById(square);
        squareElement.setAttribute('class', `square ${type}`);

        if(type === 'emptySquare') {
            emptySquares.push(square);
        } else {
            if(emptySquares.indexOf(square) !== -1) {
                emptySquares.splice(emptySquares.indexOf(square), 1);
            }
        }
    },

    // Limpiar Cuadrado
    // square: posicion del cuadrado
    cleanSquare(square) {
        const squareElement = document.getElementById(square);
        squareElement.setAttribute('class', `square ${SQUARE_TYPES.EMPTY_SQUARE}`);
    },

    //Cambiar direccion de cabeza
    headDirection(lastSquare,square,directionHead){
        let rotacion;
        // ;
        const squareElement = document.getElementById(square);
        const lastsquareElement = document.getElementById(lastSquare);
        switch(directionHead){
            //arriba
            case -10:
                rotacion="270deg";
                break;
            //abajo
            case  10:
                rotacion="90deg";
                break;
            //izquierda
            case  -1:
                rotacion="180deg";
                break;
            //derecha
            case  1:
                rotacion="0deg";
                break;
        }
        //Giramos la neuva cabeza
        squareElement.style.rotate = rotacion;
        //reiniciamos la posicion donde estaba la ccabeza antes
        lastsquareElement.style = 0;

    }
}
///////////////////////////////////////////////////////
/////////////////////  utilidades  ////////////////////
///////////////////////////////////////////////////////
const utils =  {
    // Genera un número aleatorio entre dos valores
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Crea un cuadrado de comida aleatorio
    createRandomFood() {
        const randomEmptySquare = emptySquares[
            utils.getRandomInt(0, emptySquares.length - 1)
        ];
        drawer.drawSquare(randomEmptySquare, SQUARE_TYPES.FOOD_SQUARE);
        foodSquares.push(randomEmptySquare);
        
    },

    // Crea un cuadrado de veneno aleatorio
    createRandomvenom() {
        const randomEmptySquare = emptySquares[
            utils.getRandomInt(0, emptySquares.length - 1)
        ];
        drawer.drawSquare(randomEmptySquare, SQUARE_TYPES.VENOM_SQUARE);
        venomSquares.push(randomEmptySquare);
        venomContadorTimer=utils.getRandomInt(15,30);
        console.log(venomContadorTimer);
    },

    // Crea un cuadrado de lentitud aleatorio
    createRandomSlow() {
        const randomEmptySquare = emptySquares[
            utils.getRandomInt(0, emptySquares.length - 1)
        ];
        drawer.drawSquare(randomEmptySquare, SQUARE_TYPES.SLOW_SQUARE);
        slowSquares.push(randomEmptySquare);
    },

    // modificar boton juego
    btongame(texto){
        startButton.innerHTML=texto;
    },

    // actualizar puntuacion
    updateScore() {
        scoredisplay.innerText = score;
    },

    // Localizar cuadrado
    searchSquare(directionSquare, referencia) {
        const newSquare = String(
            Number(referencia) + directionSquare)
            .padStart(2, '0');
        return newSquare;
    },
}

///////////////////////////////////////////////////////
/////////////////////  Funciones  /////////////////////
///////////////////////////////////////////////////////

// Aumento de velocidad a medida que sube el Score
function updateInterval(speed) {
    clearInterval(moveInterval);
    moveInterval = setInterval(() => gameLogic.update(), speed);
    //console.log("Game speed is " + speed);
}


// Funcion para cuando se come comida
function addFood() {
    score++;
    utils.updateScore();
    // dibujamos la serpiente
    drawer.drawSnake();
    //aceleramos la velocidad del juego
    gameSpeed = gameSpeed - (gameSpeed * 0.05);
    foodSquares = [];
    utils.createRandomFood();
    updateInterval(gameSpeed);
}

// Funcion para cuando se come veneno
function venomSnake()  {
    if(snake.length<8 || score<20){
        gameOver();
    }else{
        score++;
        score++;
        utils.updateScore();
        //aceleramos la velocidad del juego
        gameSpeed = gameSpeed+(gameSpeed*0.1);
        updateInterval(gameSpeed);
        //console.log("antes: "+trozosSnake);
        let trozosSnake = snake.length/2;
        
        for(let i=0 ; i<=trozosSnake ;i++){
            drawer.cleanSquare(snake[i]);
            //console.log(snake[i]);
        }
        console.log(snake[snake.length-1],SQUARE_TYPES.VENOM_SQUARE);
        drawer.drawSquare(snake[snake.length-1],SQUARE_TYPES.VENOM_SQUARE);
        snake.splice(0, trozosSnake);
        //console.log("despues: "+trozosSnake);
    }
    venomSquares=[];
    venomContadorTimer=0;
}

const slowSnake = () => {
    score++;
    utils.updateScore();
    gameSpeed = gameSpeed+(gameSpeed*0.1);
    updateInterval(gameSpeed);
}

const gameOver = () => {
    gameOverDiv.style.display = 'block';
    clearInterval(moveInterval);
    utils.btongame('Iniciar');
}

const gamePause = () => {
    // 0 = jugando | 1 = pausado
    // puseerror permite que no se ejecute el evento al darle click dos veces seguidas muy rapido
    if(pause===0 && pauseerror===0){
        // Se va pausar el juego
        pause=1;
        clearInterval(moveInterval);
        console.log('Pausa');
        utils.btongame('Reanudar');
    }else if(pauseerror==0){
        // Se va reanudar el juego
        pause=0;
        //se inicia de nuevo el intervalo con la velocidad que llevaba
        updateInterval(gameSpeed);
        utils.btongame('Pausar');
    }

    //correcion de error, doble ejecucion con boton y espacio
    pauseerror=1;
    setTimeout(function(){pauseerror=0;},500);
    
}

const eventHandler = {
    // Maneja los eventos del teclado
    onkeydown(event) {
        switch (event.code) {
            case "ArrowUp":
                gameLogic.setDirection(DIRECTIONS.ARROW_UP);
                break;
            case "ArrowDown":
                gameLogic.setDirection(DIRECTIONS.ARROW_DOWN);
                break;
            case "ArrowLeft":
                gameLogic.setDirection(DIRECTIONS.ARROW_LEFT);
                break;
            case "ArrowRight":
                gameLogic.setDirection(DIRECTIONS.ARROW_RIGHT);
                break;
            case "Space":
                startGame();
        }
    },
  };




///////////////////////////////////////////////////////
/////////////////////  Encendido  /////////////////////
///////////////////////////////////////////////////////

//Cargar el juego
const setGame = () => {
    // Ocultamos el GameOver
    gameOverDiv.style.display = 'none';

    // Iniciamos la serpiente, el puntaje, la direccion inicial y la memoria de los cuadrados
    snake = ['00', '01', '02', '03'];
    utils.updateScore();
    direction = DIRECTIONS.ARROW_RIGHT;
    displaySquares = Array.from(Array(DISPLAY_SIZE), () => new Array(DISPLAY_SIZE).fill(SQUARE_TYPES.EMPTY_SQUARE));
    //console.log(snake);

    // Vaciamos el display y los emptySquares
    display.innerHTML = '';
    emptySquares = [];
    foodSquares = [];
    venomSquares = [];
    slowSquares = [];

    // Dibujamos la serpiente, los cuadros vacios y la comida.
    drawer.createdisplay();
    drawer.drawSnake();
    utils.createRandomFood();

}

//Iniciar el juego
const startGame = () => {
    
    //console.log(score,' style ',gameOverDiv.style.display)
    if(gameOverDiv.style.display !== "none" || score==0){
        //Carga del juego
        setGame();
        directionold = [];

        // Pendiente de keydown
        document.addEventListener('keydown', eventHandler.onkeydown);

        //Velocidad inicial del juego
        gameSpeed = gameSpeedinicial;

        // Inicia el intervalo de movimiento de la serpiente
        updateInterval(gameSpeed);
        utils.btongame('Pausar');

        // incio del score
        score=0;
        score++;
        utils.updateScore();
    }else{
        gamePause();
    }
    
}

setGame();
startButton.addEventListener('click', startGame);