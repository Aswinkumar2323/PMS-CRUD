const passport = require('passport');

// This middleware checks if the user is authenticated via JWT
const protect = passport.authenticate('jwt', { session: false });

module.exports = { protect };
