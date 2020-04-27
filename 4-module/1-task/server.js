const url = require('url');
const http = require('http');
const path = require('path');
const {finished} = require('stream');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  switch (req.method) {
    case 'GET':
      sendFileSafe(url.parse(req.url).pathname, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

function sendFileSafe(filePathFromUrl, res) {
  try {
    filePathFromUrl = decodeURIComponent(filePathFromUrl);
  } catch(e) {
    res.statusCode = 400;
    res.end("Некорректный запрос");
    return;
  }

  if (~filePathFromUrl.indexOf('\0')) {
    res.statusCode = 400;
    res.end("Нулевой байт");
    return;
  }

  let subPaths = filePathFromUrl.split('/');
  subPaths.shift();

  if (subPaths.length > 1) {
    res.statusCode = 400;
    res.end("Недопустимый путь: вложенная директория");
    return;
  }

  let filePathOnDisk = path.join(__dirname, 'files', filePathFromUrl);
  filePathOnDisk = path.normalize(filePathOnDisk);

  fs.stat(filePathOnDisk, function(err, stats) {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.end("Файл не найден");
      return;
    }

    sendFile(filePathOnDisk, res);
  });
}

function sendFile(filePath, res) {
  // npm i mime
  // const Mime = require('mime');
  // mime = Mime.getType(filePath);
  // res.setHeader('Content-Type', mime + "; charset=utf-8");

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  finished(fileStream, err => {
    if (err) {
      res.statusCode = 500;
      res.end("Ошибка сервера");
    } else {
      res.end();
    }
  });
}

module.exports = server;
