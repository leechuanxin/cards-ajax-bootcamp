import db from './models/index.mjs';

import initGamesController from './controllers/games.mjs';
import initLoginController from './controllers/login.mjs';

export default function bindRoutes(app) {
  const GamesController = initGamesController(db);
  const LoginController = initLoginController(db);
  // main page
  app.get('/', GamesController.index);
  // create a new game
  app.post('/games', GamesController.create);
  // update a game with new cards
  app.put('/games/:id/deal', GamesController.deal);
  app.post('/login', LoginController.login);
}
