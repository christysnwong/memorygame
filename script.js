// -----------------------------------------------------------------------
// Global Variables
// -----------------------------------------------------------------------

const BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const POKEMON_SELECTION = 150; // max total - 898 pokemon available

let card1Div = null;
let card2Div = null;

let imgPaths = [];
let disableClick = false;
let scoreCounter = 0;

let currGameSize;

// -----------------------------------------------------------------------
// Initial Setup by Selecting & Setting Up Elements & EventListeners
// -----------------------------------------------------------------------

const startBtn = document.getElementById('start-btn');
startBtn.addEventListener("click", newGame);

const resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", newGame);

const tableSize = document.getElementById("table-size");

let savedScore = JSON.parse(localStorage.getItem('pokemem-savedScore')) || 0;
const bestScore = document.querySelector('#best-score');

if (savedScore[tableSize.value]) {
  bestScore.innerText = savedScore[tableSize.value];
} else {
  bestScore.innerText = "N/A";
}

const score = document.querySelector('#score');
score.innerText = scoreCounter;

const size = document.querySelector("#size");
size.innerText = `${tableSize.value}x${tableSize.value}`;

const table = document.getElementById("game-board");
table.addEventListener("click", handleCardClick);

const end = document.getElementById("end");
const msg = document.getElementById("msg");

// -----------------------------------------------------------------------
// Functions for the Memory Game
// -----------------------------------------------------------------------

// Create HTML Board
function createBoard(tableSize) {
  table.innerHTML = "";

  for (let row = 0; row < tableSize; row++) {
    let tr = document.createElement("tr");
    for (let col = 0; col < tableSize; col++) {
      let td = document.createElement("td");
      td.setAttribute("id", `${row}-${col}`);

      if (
        tableSize % 2 !== 0 &&
        row === Math.floor(tableSize / 2) &&
        col === Math.floor(tableSize / 2)
      ) {
        let imgPikachu = document.createElement("img");
        imgPikachu.setAttribute("src", "imgs/pikachu.png");
        td.append(imgPikachu);

      } else {

        let divCard = document.createElement("div");
        divCard.classList.add("card");

        let divCardFront = document.createElement("div");
        divCardFront.classList.add("front");

        let imgPokeball = document.createElement("img");
        imgPokeball.classList.add("pokeball");
        imgPokeball.setAttribute("src", "imgs/pokeball.png");
        imgPokeball.setAttribute("width", "60px");
        divCardFront.append(imgPokeball);

        let divCardBack = document.createElement("div");
        divCardBack.classList.add("back");

        divCard.append(divCardFront, divCardBack);
        td.append(divCard);

      }

      tr.append(td);
    }

    table.append(tr);
  }
}

// Get Image Array
function getImgs(tableSize) {
  let cardTotal = 0;
  let randPokemon = new Set();
  
  if (tableSize % 2 !== 0) {
    cardTotal = tableSize ** 2 - 1;
  } else {
    cardTotal = tableSize ** 2;
  }

  while (randPokemon.size !== cardTotal/2) {
    let randId = Math.floor(Math.random() * POKEMON_SELECTION + 1);
    randPokemon.add(randId);
  }

  for (let id of randPokemon) {
    imgPaths.push(`${BASE_URL}/${id}.png`);
    imgPaths.push(`${BASE_URL}/${id}.png`);
  }

}

// Shuffle the image array
function shuffle() {
  let counter = imgPaths.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    [imgPaths[counter], imgPaths[index]] = [imgPaths[index], imgPaths[counter]];
  }

}


// Get & set images to the board
function setImgs(tableSize) {
  getImgs(tableSize);
  shuffle();

  let paths = [...imgPaths];

  for (let row = 0; row < tableSize; row++) {
    for (let col = 0; col < tableSize; col++) {
      if (
        tableSize % 2 !== 0 &&
        row === Math.floor(tableSize / 2) &&
        col === Math.floor(tableSize / 2)
      ) {
        continue;
      }

      let tdId = `${row}-${col}`;
      let td = document.getElementById(tdId);
      let imgPath = paths.shift();

      let img = document.createElement("img");
      img.setAttribute("src", imgPath);

      td.children[0].children[1].append(img);
    }
  }
}

// Start or reset a game
function newGame() {

  currGameSize = tableSize.value;
  size.innerText = `${currGameSize}x${currGameSize}`;

  if (savedScore[currGameSize]) {
    bestScore.innerText = savedScore[currGameSize];
  } else {
    bestScore.innerText = "N/A";
  }

  // Reset all values
  end.classList.remove("over");
  startBtn.innerText = "New Game";
  card1Div = null;
  card2Div = null;
  
  imgPaths = [];
  scoreCounter = 0;
  score.innerText = scoreCounter;

  createBoard(currGameSize);
  setImgs(currGameSize);
}

// Handle clicks on cards
function handleCardClick(event) {
  // Allows user to select only 2 cards at a time

  let currCardDiv;
  if (disableClick) {
    return;
  }

  if (event.target.classList.contains('front')) {
    currCardDiv = event.target.parentElement;
  } else if (event.target.tagName === 'IMG') {
    currCardDiv = event.target.parentElement.parentElement;
  } else {
    return;
  }

  // disable further action for selecting the same card
  if (currCardDiv.classList.contains('flipped')) {
    return;
  } 
  
  // Define card 1 and 2
  if (card1Div === null || card2Div === null) {
    currCardDiv.classList.add('flipped');
    card1Div = card1Div || currCardDiv;
    card2Div = currCardDiv === card1Div ? null : currCardDiv;

    addScore();
  } 
  
  // Compare cards if they are both selected and defined
  if (card1Div && card2Div) {
    disableClick = true;
    compareCards();
  }

  
}

// Compare 2 cards 
function compareCards() {

  card1Img = card1Div.children[1].children[0].src;
  card2Img = card2Div.children[1].children[0].src;
        
  if (card1Img === card2Img) {
    checkforWinning();

    card1Div = null;
    card2Div = null;

    disableClick = false;
  } else {
    resetCard();
  }
}

// Reset cards if they don't match
function resetCard() {
  setTimeout(function() {
    card1Div.classList.remove('flipped');
    card2Div.classList.remove('flipped');
    card1Div = null;
    card2Div = null;

    disableClick = false;
  }, 1000)
}

// Increment the score counter
function addScore() {
  scoreCounter++;
  score.innerText = scoreCounter;
}

// Check if the winning condition has met
function checkforWinning() {
  let winCount = 0;
  const checkDivs = document.querySelectorAll('div.card');

  for (let div of checkDivs) {
    if (div.classList.contains('flipped')) {
      winCount++;
    }
  }

  if (winCount === imgPaths.length) {
    
    end.classList.add("over");  
    msg.innerText = `Your score is ${scoreCounter}`;

    if (
      savedScore[currGameSize] === undefined ||
      scoreCounter < savedScore[currGameSize]
    ) {
      msg.innerText = `You made a record! Your new best score is ${scoreCounter}`;
      bestScore.innerText = scoreCounter;

      // Update the global variable savedScore and localStorage's savedScore
      savedScore = { ...savedScore, [currGameSize]: scoreCounter };
      localStorage.setItem(
        "pokemem-savedScore",
        JSON.stringify({ ...savedScore })
      );
      
    }
  }
}
    

