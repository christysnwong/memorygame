class PokeMemGame {
  constructor(POKEMON_SELECTION = 150) {
    this.POKEMON_SELECTION = POKEMON_SELECTION;
    this.$card1Div = null;
    this.$card2Div = null;
    this.imgPaths = [];
    this.disableClick = false;
    this.scoreCounter = 0;
    this.currGameSize;
    this.savedScore =
      JSON.parse(localStorage.getItem("pokemem-savedScore")) || 0;
    this.IMG_BASE_URL =
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

    // setting up eventListeners
    $("#start-btn").on("click", this.newGame.bind(this));
    $("#reset-btn").on("click", this.newGame.bind(this));
    $("#game-board").on("click", this.handleCardClick.bind(this));
  }

  // Create HTML Board
  createBoard(tableSize) {
    $("#game-board").empty();

    for (let row = 0; row < tableSize; row++) {
      let $tr = $("<tr></tr>");
      for (let col = 0; col < tableSize; col++) {
        let $td = $("<td></td>").attr("id", `${row}-${col}`);

        if (
          tableSize % 2 !== 0 &&
          row === Math.floor(tableSize / 2) &&
          col === Math.floor(tableSize / 2)
        ) {
          let $imgPikachu = $("<img>").attr("src", "imgs/pikachu.png");
          $td.append($imgPikachu);
        } else {
          let $divCard = $("<div></div>").addClass("card");
          let $divCardFront = $("<div></div>").addClass("front");

          let $imgPokeball = $("<img>")
            .addClass("pokeball")
            .attr("src", "imgs/pokeball.png")
            .attr("width", "60px");

          $divCardFront.append($imgPokeball);

          let $divCardBack = $("<div></div>").addClass("back");

          $divCard.append($divCardFront, $divCardBack);
          $td.append($divCard);
        }

        $tr.append($td);
      }

      $("#game-board").append($tr);
    }
  }

  // Get Image Array
  getImgs(tableSize) {
  
    let cardTotal = 0;
    let randPokemon = new Set();

    if (tableSize % 2 !== 0) {
      cardTotal = tableSize ** 2 - 1;
    } else {
      cardTotal = tableSize ** 2;
    }

    while (randPokemon.size !== cardTotal / 2) {
      let randId = Math.floor(Math.random() * this.POKEMON_SELECTION + 1);
      randPokemon.add(randId);
    }

    for (let id of randPokemon) {
      this.imgPaths.push(`${this.IMG_BASE_URL}/${id}.png`);
      this.imgPaths.push(`${this.IMG_BASE_URL}/${id}.png`);
    }
  }

  // Shuffle the image array
  shuffle() {
    let counter = this.imgPaths.length;

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      let index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      [this.imgPaths[counter], this.imgPaths[index]] = [
        this.imgPaths[index],
        this.imgPaths[counter],
      ];
    }
  }

  // Get & set images to the board
  setImgs(tableSize) {
    this.getImgs(tableSize);
    this.shuffle();

    let paths = [...this.imgPaths];

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
        let $td = $(`#${tdId}`);
        let imgPath = paths.shift();
        let $img = $("<img>").attr("src", imgPath);

        $td.find(".back").append($img);
      }
    }
  }

  // Start or reset a game
  newGame() {
    this.currGameSize = $("#table-size").val();
    $("#size").text(`${this.currGameSize}x${this.currGameSize}`);

    if (this.savedScore[this.currGameSize]) {
      $("#best-score").text(this.savedScore[this.currGameSize]);
    } else {
      $("#best-score").text("N/A");
    }

    // Reset all values
    $("#end").removeClass("over");
    $("#start-btn").text("New Game");

    this.imgPaths = [];
    this.scoreCounter = 0;

    $("#score").text(this.scoreCounter);

    this.createBoard(this.currGameSize);
    this.setImgs(this.currGameSize);
  }

  // Handle clicks on cards
  handleCardClick(event) {
    // Allows user to select only 2 cards at a time

    let $currCardDiv;

    if (this.disableClick) {
      return;
    }

    if ($(event.target).hasClass("front")) {
      $currCardDiv = $(event.target).parent();
    } else if (event.target.tagName === "IMG") {
      $currCardDiv = $(event.target).parent().parent();
    } else {
      return;
    }

    // disable further action for selecting the same card
    if ($currCardDiv.hasClass("flipped")) {
      return;
    }

    // Define card 1 and 2
    if (this.$card1Div === null || this.$card2Div === null) {
      $currCardDiv.addClass("flipped");

      this.$card1Div = this.$card1Div || $currCardDiv;
      this.$card2Div = $currCardDiv === this.$card1Div ? null : $currCardDiv;

      this.addScore();
    }

    // Compare cards if they are both selected and defined
    if (this.$card1Div && this.$card2Div) {
      this.disableClick = true;
      if (this.compareCards()) {
        // if both cards are the same, check for winning
        this.checkforWinning();
      } else {
        // if not, reset and unflip cards
        this.resetCards();
      }
    }
  }

  // Compare 2 cards
  compareCards() {
    let card1Img = this.$card1Div.find(".back img").attr("src");
    let card2Img = this.$card2Div.find(".back img").attr("src");

    if (card1Img === card2Img) {
      this.$card1Div = null;
      this.$card2Div = null;
      this.disableClick = false;

      return true;
    } else {
      return false;
    }
  }

  // Reset cards if they don't match
  resetCards() {
    setTimeout(() => {
      this.$card1Div.removeClass("flipped");
      this.$card2Div.removeClass("flipped");
      this.$card1Div = null;
      this.$card2Div = null;

      this.disableClick = false;
    }, 1000);
  }

  // Increment the score counter
  addScore() {
    this.scoreCounter++;
    $("#score").text(this.scoreCounter);
  }

  // Check if the winning condition has met
  checkforWinning() {
    let winCount = 0;
    const $checkDivs = $("div.card");

    $checkDivs.each(function () {
      if ($(this).hasClass("flipped")) {
        winCount++;
      }
    });

    if (winCount === this.imgPaths.length) {
      $("#end").addClass("over");
      $("#msg").text(`Your score is ${this.scoreCounter}`);

      if (
        this.savedScore[this.currGameSize] === undefined ||
        this.scoreCounter < this.savedScore[this.currGameSize]
      ) {
        $("#msg").text(
          `You made a record! Your new best score is ${this.scoreCounter}`
        );
        $("#best-score").text(this.scoreCounter);

        // Update the global variable savedScore and localStorage's savedScore
        this.savedScore = {
          ...this.savedScore,
          [this.currGameSize]: this.scoreCounter,
        };
        localStorage.setItem(
          "pokemem-savedScore",
          JSON.stringify({ ...this.savedScore })
        );
      }
    }
  }
}

// initialize the Pokemon Memory Game
const game = new PokeMemGame();
