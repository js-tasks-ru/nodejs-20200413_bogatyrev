module.exports = function mapMessage(message) {
  return {
    id: message.id,
    date: message.date.toISOString(),
    text: message.text,
    user: message.user,
  };
};
