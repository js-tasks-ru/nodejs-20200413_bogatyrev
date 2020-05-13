const Message = require('../models/Message');
const mapMessage = require('../mappers/message');

module.exports.messageList = async function messages(ctx, next) {
  const messages = await Message.find({}).limit(1) || [];
  ctx.body = {messages: messages.map(mapMessage)};
};
