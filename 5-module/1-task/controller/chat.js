var clients = [];

module.exports = {
  async subscribe(ctx) {
    const responsePromise = new Promise((resolve, reject) => {
      ctx.state.resolvePromise = resolve;
    })
      .then((message) => {
        ctx.body = message;
      });

    clients.push(ctx);

    ctx.res.on('close', function () {
      clients.splice(clients.indexOf(ctx), 1);
    });

    await responsePromise;
  },

  async publish(ctx) {
    const message = ctx.request.body.message;

    if (message) {
      clients.forEach(function (context) {
        context.state.resolvePromise(message);
      });

      clients = [];
    }

    ctx.body = 'OK';
  },
}
