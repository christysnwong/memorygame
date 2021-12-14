// Define variables
const gameContainer = document.getElementById("game");

let card1Div = null;
let card1DivColor = null;
let card2Div = null;
let card2DivColor

let disableClick = false;

const start = document.getElementById('start');
start.addEventListener('click', startGame);

const reset = document.getElementById('reset');
reset.addEventListener('click', resetGame);

let counter = 0;
let savedScore = JSON.parse(localStorage.getItem('savedScore'));
const bestScore = document.querySelector('#best-score');
bestScore.innerText = savedScore === null? `Best Score: ${counter}`: `Best Score: ${savedScore}`;
const score = document.querySelector('#score');
score.innerText = `Score: ${counter}`;

const msg = document.querySelector('#msg');


// Define color for the cards
const COLORS = [
  "red",
  "blue",
  "green",
  "orange",
  "purple",
  "teal",
  "red",
  "blue",
  "green",
  "orange",
  "purple",
  "teal"
];

// Function to shuffle an array
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

let shuffledColors = shuffle(COLORS);

// Function to loop over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {
  for (let color of colorArray) {
    // create a new div
    const newDiv = document.createElement('div');

    // give it a class attribute for the value we are looping over
    newDiv.classList.add(color);

    // call a function handleCardClick when a div is clicked on
    newDiv.addEventListener('click', handleCardClick);

    // append the div to the element with an id of game
    gameContainer.append(newDiv);

  }
  
}


function startGame() {
  createDivsForColors(shuffledColors);
  start.remove();
} 

function resetGame() {
  gameContainer.textContent = '';
  shuffledColors = shuffle(COLORS);
  createDivsForColors(shuffledColors);
  counter = 0;
  score.innerText = `Score: ${counter}`;
  msg.innerText = 'Try to get the lowest score by using the least number of moves to flip all cards.';
}

function handleCardClick(event) {
  // Allows user to select only 2 cards at a time
  if (disableClick) {
    return;
  }

  const currCardDiv = event.target;
  currCardDiv.style.backgroundColor = currCardDiv.className;

  // disableClick for selecting the same card
  if (currCardDiv.classList.contains('flipped')) {
    msg.innerText = 'You have already selected or matched this card.';
    disableClick = false;
    return;
  } 
  
  // Define card 1 and 2
  if (card1Div === null || card2Div === null) {
    currCardDiv.classList.add('flipped');
    card1Div = card1Div || currCardDiv;
    card2Div = currCardDiv === card1Div ? null : currCardDiv;

    addScore();
    disableClick = false;
  } 
  
  // Compare cards if they are both selected and defined
  if (card1Div && card2Div) {
    disableClick = true;
    compareCards();
  }

  function compareCards() {
    card1DivColor = card1Div.className;
    card2DivColor = card2Div.className
          
    if (card1DivColor === card2DivColor) {
      msg.innerText = 'You are correct!';
      
      checkforWinning();

      card1Div = null;
      card2Div = null;

      disableClick = false;

    } else {
      resetCard();
    }
  }

  function resetCard() {
    setTimeout(function() {
      card1Div.style.backgroundColor = '';
      card2Div.style.backgroundColor = '';
      card1Div.classList.remove('flipped');
      card2Div.classList.remove('flipped');
      card1Div = null;
      card2Div = null;

      msg.innerText = '';
      disableClick = false;
    }, 1000)
  }
}

function addScore() {
  counter++;
  score.innerText = `Score: ${counter}`;
}

function checkforWinning() {
  let winCount = 0;
  const checkDivs = document.querySelectorAll('div > div');

  for (let div of checkDivs) {
    if (div.classList.contains('flipped')) {
      winCount++;
    }
  }
  if (winCount === COLORS.length) {
      msg.innerText = 'YOU WON!';

    if (savedScore === null || counter < savedScore) {
      bestScore.innerText = `Best Score: ${counter}`;

      savedScore = counter;
      localStorage.setItem('savedScore', JSON.stringify(counter));

      msg.innerText = 'YOU WON! Your best score is updated!';
    }
  }
}
    

