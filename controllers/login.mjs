import util from '../util.js';
import SALT from '../globals.js';

export default function initLoginController(db) {
  // render the main page
  const login = async (req, res) => {
    try {
      const user = await db.User.findOne({
        where: {
          username: req.body.username,
        },
      });

      if (user) {
        // check password and login
        const hashedPassword = util.getHash(req.body.password);
        if (hashedPassword === user.password) {
          // create an unhashed cookie string based on user ID and salt
          const unhashedCookieString = `${user.id}-${SALT}`;
          // generate a hashed cookie string using SHA object
          const hashedCookieString = util.getHash(unhashedCookieString);
          // set the loggedIn and userId cookies in the response
          // The user's password hash matches that in the DB and we authenticate the user.
          res.cookie('loggedIn', hashedCookieString);
          res.cookie('userId', user.id);
          res.send({
            loggedIn: hashedCookieString,
            userId: user.id,
          });
        } else {
          throw new Error('Something went wrong!');
        }
      }
    } catch (error) {
      res.send({
        error: error.message,
      });
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    login,
  };
}
