const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.incompleteLine = '';
  }

  _transform(chunk, encoding, callback) {
    const chunkStr = chunk.toString();
    const lines = chunkStr.split(os.EOL);
    const currentIncompleteLine = lines.pop();

    for (let line of lines) {
      if (this.incompleteLine) {
        line = this.incompleteLine + line;
        this.incompleteLine = '';
      }

      this.push(line);
    }

    // save incomplete line in memory
    if (this.incompleteLine) {
      this.incompleteLine += currentIncompleteLine;
    } else {
      this.incompleteLine = currentIncompleteLine;
    }

    callback(null);
  }

  _flush(callback) {
    if (this.incompleteLine) {
      this.push(this.incompleteLine);
      this.incompleteLine = '';
    }

    callback(null);
  }
}

module.exports = LineSplitStream;
