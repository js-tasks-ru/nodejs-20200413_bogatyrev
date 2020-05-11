const uuid = require('uuid/v4');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');
const passport = require('../libs/passport');

module.exports.register = async (ctx, next) => {
  const email = ctx.request.body.email;
  const displayName = ctx.request.body.displayName;
  const token = uuid();
  let user;

  try {
    user = await User.create({
      email: email,
      displayName: displayName,
      verificationToken: token,
    });
  } catch (e) {
    ctx.status = 400;

    const errors = Object.values(e.errors).map(error => {
      let result = [];
      result.push(error.path);
      result.push(error.message);
      return result;
    });

    ctx.body = {errors: Object.fromEntries(errors)};
    return;
  }

  const password = ctx.request.body.password;
  await user.setPassword(password);
  await user.save();

  await sendMail({
    template: 'confirmation',
    locals: {token: token},
    to: email,
    subject: 'Подтвердите почту',
  });

  ctx.status = 200;
  ctx.body = {status: 'ok'};
};

module.exports.confirm = async (ctx, next) => {
  const verificationToken = ctx.request.body.verificationToken;

  let user = await User.findOne({verificationToken: verificationToken});
  if (!user) {
    ctx.throw(400, 'Ссылка подтверждения недействительна или устарела');
  }

  user.verificationToken = undefined;
  user.markModified('verificationToken');
  await user.save();

  const token = await ctx.login(user);
  ctx.body = {token: token};
};
