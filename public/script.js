const loginForm = document.querySelector('#loginForm');

// global value that holds info about the current hand.
let currentGame = null;

// create game btn
const createGameBtn = document.createElement('button');
const createGameContainer = document.createElement('div');
const createGameRow = document.createElement('div');
const createGameCol = document.createElement('div');

const triggerRefresh = () => {
  axios.get(`/games/${currentGame.id}/show`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // display it to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

// DOM manipulation function that displays the player's current hand.
const runGame = function ({
  playerHand, otherPlayer, winner, scores,
}) {
  // manipulate DOM
  if (playerHand.length >= 2) {
    const gameContainer = document.querySelector('#game-container');
    gameContainer.innerHTML = '';
    const refreshButton = document.createElement('button');
    refreshButton.innerText = 'Refresh';
    const btnDiv = document.createElement('div');
    btnDiv.className = 'col-12 text-end';
    btnDiv.addEventListener('click', triggerRefresh);
    btnDiv.appendChild(refreshButton);
    const player1Div = document.createElement('div');
    const player2Div = document.createElement('div');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'col-12 text-center mt-5';
    player1Div.className = 'col-6 text-center';
    player2Div.className = 'col-6 text-center';
    player1Div.innerText = `
    Your Hand:
    ====
    ${playerHand[0].name}
    of
    ${playerHand[0].suit}
  `;
    player2Div.innerText = `
    ${otherPlayer.realName}'s Hand:
    ====
    ${playerHand[1].name}
    of
    ${playerHand[1].suit}
  `;
    if (winner && winner.realName) {
      feedbackDiv.innerHTML = `<strong>${winner.realName}</strong> has won this round!`;
    } else {
      feedbackDiv.innerHTML = 'It\'s a tie!';
    }
    feedbackDiv.innerHTML += `<br/><br/><strong>Current Scores:</strong><br/><em>You:</em> ${scores[0]}<br/><em>${otherPlayer.realName}:</em> ${scores[1]}<br/>`;
    gameContainer.appendChild(btnDiv);
    gameContainer.appendChild(player1Div);
    gameContainer.appendChild(player2Div);
    gameContainer.appendChild(feedbackDiv);
  }

  const dealContainer = document.querySelector('#dealContainer');
  if (!dealContainer) {
    renderDealBtn();
  }
};

const renderDealBtn = () => {
  const dealContainer = document.createElement('div');
  const dealRow = document.createElement('div');
  const dealCol = document.createElement('div');
  dealContainer.id = 'dealContainer';
  dealContainer.classList.add('container');
  dealRow.classList.add('row');
  dealCol.className = 'col-12 text-center mt-3';
  const dealBtn = document.createElement('button');
  dealBtn.addEventListener('click', dealCards);

  // display the button
  dealBtn.innerText = 'Deal';
  dealCol.appendChild(dealBtn);
  dealRow.appendChild(dealCol);
  dealContainer.appendChild(dealRow);
  document.body.appendChild(dealContainer);
};

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // display it to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const createGame = function () {
  createGameContainer.classList.toggle('d-none');
  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;

      // display it out to the user
      // runGame(currentGame);

      // for this current game, create a button that will allow the user to
      // manipulate the deck that is on the DB.
      // Create a button for it.
      const dealContainer = document.querySelector('#dealContainer');
      if (!dealContainer) {
        renderDealBtn();
      }
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

// manipulate DOM, set up create game button
createGameBtn.addEventListener('click', createGame);
createGameBtn.innerText = 'Create Game';
createGameContainer.className = 'container mt-3 d-none';
createGameRow.classList.add('row');
createGameCol.className = 'col-12 text-center';
createGameCol.appendChild(createGameBtn);
createGameRow.appendChild(createGameCol);
createGameContainer.appendChild(createGameRow);
document.body.appendChild(createGameContainer);

const getCookie = (cname) => {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

const loggedInUser = getCookie('userId');
if (loggedInUser && loggedInUser !== '') {
  loginForm.innerHTML = '';
  let gameObj = {};
  axios.get('/games/showusergame')
    .then((response) => {
      gameObj = { ...gameObj, ...response.data.gameState };
      if (Object.keys(gameObj).length > 0) {
        // display it to the user
        gameObj = { ...gameObj, id: response.data.id };
        currentGame = gameObj;
        runGame(currentGame);
      } else {
        createGameContainer.classList.toggle('d-none');
      }
    })
    .catch((err) => console.log('err :>> ', err));
}

const loginSignupButton = document.querySelector('#loginSignupButton');
if (loginSignupButton) {
  loginSignupButton.addEventListener('click', () => {
    let inputs = [...loginForm.querySelectorAll('input')];
    inputs = inputs.map((input) => input.value);
    const dataToSend = {
      username: inputs[0],
      password: inputs[1],
    };
    axios
      .post('/login', dataToSend)
      .then((response) => {
        if (response.data.loggedIn) {
          loginForm.innerHTML = '';
          createGameContainer.classList.toggle('d-none');
        }
      })
      .catch((err) => console.log('err :>> ', err));
  });
}
