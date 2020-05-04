const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');
const stream = require('stream');
const finished = stream.finished;
const util = require('util');
const pipeline = util.promisify(stream.pipeline);

const server = new http.Server();

server.on('request', (req, res) => {
  switch (req.method) {
    case 'POST':
      uploadFile(req, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

/**
 * Upload file to the files folder.
 * @param req
 * @returns {Promise<void>}
 */
async function uploadFile(req, res) {
  const fileNameFromUrl = url.parse(req.url).pathname.slice(1);
  const filePathOnDisk = path.join(__dirname, 'files', fileNameFromUrl);

  if (isNestedPath(fileNameFromUrl)) {
    res.statusCode = 400;
    res.end('Nested paths are not allowed.');
    return;
  }

  if (await isFileExists(filePathOnDisk)) {
    res.statusCode = 409;
    res.end('File already exists.');
    return;
  }

  const transformStream = new LimitSizeStream({limit: 1048576}); // 1МБ
  finished(transformStream, (err) => {
    if (err) {
      if (err instanceof LimitExceededError) {
        res.statusCode = 413;
        res.end('File is too big.');
      } else {
        res.statusCode = 500;
        res.end('Server error.');
      }
    } else {
      res.statusCode = 201;
      res.end('File Uploaded.');
    }
  });

  const writeStream = fs.createWriteStream(filePathOnDisk);
  // здесь файл уже создан!

  // Если в процессе загрузки файла на сервер произошел обрыв соединения —
  // созданный файл с диска надо удалять.
  req.on('close', () => {
    handleReqClose(req, res, writeStream, filePathOnDisk);
  });

  await pipeline(
    req,
    transformStream,
    writeStream
  ).catch((err) => {
    // after finished
  });

  const stats = await fsPromises.stat(filePathOnDisk);
  if (stats && stats.size == 0) {
    removeFile(filePathOnDisk);
  }
}

/**
 * Remove file from the files folder.
 * @param path
 * @returns {Promise<void>}
 */
async function removeFile(path) {
  await fsPromises.unlink(path);
}

/**
 * Handle connection close event.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function handleReqClose(req, res, writeStream, filePathOnDisk) {
  if (req.complete) return;

  if (writeStream) {
    writeStream.destroy();
  }

  if (await isFileExists(filePathOnDisk)) {
    removeFile(filePathOnDisk);
  }
}

/**
 * Check if path contains subdirectories.
 * @param path
 * @returns {boolean}
 */
function isNestedPath(path) {
  return (path.includes('/') || path.includes('..'));
}

/**
 * Check if file already exists.
 * @param path
 * @returns {Promise<void>}
 */
function isFileExists(path) {
  return fsPromises.access(path, fs.constants.F_OK)
    .then(() => true)
    .catch((err) => (err.code != 'ENOENT'));
}

module.exports = server;
