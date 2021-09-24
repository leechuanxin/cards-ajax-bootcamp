/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function initGamesController(db) {
  // render the main page
  const index = async (request, response) => {
    response.render('games/index');
  };

  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    // deal out a new shuffled deck for this game.
    const cardDeck = shuffleCards(makeDeck());
    // const playerHand = [cardDeck.pop(), cardDeck.pop()];

    try {
      const user = await db.User.findOne({
        where: {
          id: request.cookies.userId,
        },
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        throw new Error('You need to be logged in!');
      }

      const users = await db.User.findAll({
        where: {
          id: {
            [db.Sequelize.Op.not]: user.dataValues.id,
          },
        },
        attributes: { exclude: ['password'] },
      });

      const randomIndex = Math.floor(Math.random() * users.length);

      const newGame = {
        gameState: {
          cardDeck,
          winner: {},
          scores: [0, 0],
          playerHand: [],
          otherPlayer: users[randomIndex].dataValues,
        },
      };

      // run the DB INSERT query
      const game = await db.Game.create(newGame);

      // create entries in games_users table
      await Promise.all([
        game.addUser(user),
        game.addUser(users[randomIndex]),
      ]);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        otherPlayer: users[randomIndex].dataValues,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // deal two new cards from the deck.
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      let game = await db.Game.findByPk(request.params.id);

      if (game.gameState.cardDeck.length < 2) {
        game = await game.update({
          gameState: {
            cardDeck: shuffleCards(makeDeck()),
            winner: game.gameState.winner,
            scores: game.gameState.scores,
            playerHand: game.gameState.playerHand,
            otherPlayer: game.gameState.otherPlayer,
          },
        }, {
          returning: true,
        });
      }

      const user = await db.User.findOne({
        where: {
          id: request.cookies.userId,
        },
        attributes: { exclude: ['password'] },
      });

      const players = await game.getUsers({
        where: {
          id: {
            [db.Sequelize.Op.not]: request.cookies.userId,
          },
        },
        attributes: { exclude: ['password'] },
      });

      // make changes to the object
      const playerHand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      const player1Card = playerHand[0];
      const player2Card = playerHand[1];

      let winner = {};
      const { scores } = game.gameState;

      if (player1Card.rank > player2Card.rank) {
        winner = user.dataValues;
        scores[0] += 1;
      } else if (player1Card.rank < player2Card.rank) {
        winner = players[0].dataValues;
        scores[1] += 1;
      }

      // update the game with the new info
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          playerHand,
          winner,
          scores,
          otherPlayer: game.gameState.otherPlayer,
        },
      });

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        otherPlayer: players[0].dataValues,
        winner,
        scores,
      });
    } catch (error) {
      response.status(500).send(error.stack);
    }
  };

  // deal two new cards from the deck.
  const show = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);

      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        otherPlayer: game.gameState.otherPlayer,
        winner: game.gameState.winner,
        scores: game.gameState.scores,
      });
    } catch (error) {
      response.status(500).send(error.stack);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
    show,
  };
}
