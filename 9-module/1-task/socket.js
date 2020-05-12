const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, next) {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error("anonymous sessions are not allowed"));
    }

    const session = await Session.findOne({token: token}).populate('user');
    if (!session) {
      return next(new Error("wrong or expired session token"));
    }

    socket.user = session.user;
    next();
  });

  io.on('connection', function(socket, next) {

    socket.on('message', async (msg) => {
      try {
        await Message.create({
          user: socket.user.displayName,
          chat: socket.user.id,
          text: msg,
          date: new Date(),
        });
      } catch (e) {
        next(e.errors.shift());
      }
    });
  });

  return io;
}

module.exports = socket;
