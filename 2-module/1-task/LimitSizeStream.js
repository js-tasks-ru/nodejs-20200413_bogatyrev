const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.totalBytesRead = 0;
  }

  _transform(chunk, encoding, callback) {
    this.totalBytesRead += chunk.length;
    if (this.totalBytesRead > this.limit) {
      callback(new LimitExceededError());
    } else {
      this.push(chunk);
      callback(null);
    }
  }
}

module.exports = LimitSizeStream;
