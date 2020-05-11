const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
  {usernameField: 'email', session: false},
  async (email, password, done) => {
    const authResult = await User.login(email, password);
    if (authResult instanceof User) {
      return done(null, authResult);
    }

    done(null, false, authResult);
  },
);
