const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

class Unauthorized extends Error {
  constructor() {
    super('Unauthorized');
    this.status = 401;
    this.expose = true;
  }
}

module.exports = new LocalStrategy(
  {usernameField: 'email', session: false},
  async (email, password, done) => {
    const user = await User.login(email, password);
    if (user) {
      return done(null, user);
    }

    done(new Unauthorized());
  },
);
