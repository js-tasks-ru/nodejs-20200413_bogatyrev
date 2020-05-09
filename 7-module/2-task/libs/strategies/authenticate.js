const User = require('../../models/User');

function resolveAuth(err, user, done) {
  if (err) {
    return done(err);
  }

  if (user) {
    return done(null, user);
  }
}

module.exports = function authenticate(strategy, email, displayName, done) {
  if (!email) {
    return done(null, false, `Не указан email`);
  }

  User.findOne({email: email}, function (err, user) {
    if (err || user) {
      return resolveAuth(err, user, done);
    } else {
      user = new User({
        email: email,
        displayName: email
      });

      user.save({}, (err, user) => {
        return resolveAuth(err, user, done);
      });
    }
  });
};
