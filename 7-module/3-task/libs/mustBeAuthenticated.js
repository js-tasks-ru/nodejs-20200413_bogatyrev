module.exports = function mustBeAuthenticated(ctx, next) {
  if (ctx.user) {
    return next();
  }

  ctx.status = 401;
  ctx.body = {error: 'Пользователь не залогинен'};
};
