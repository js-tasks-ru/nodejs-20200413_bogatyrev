const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');
const {pipeline, finished} = require('stream');
// const util = require('util');
// const pipeline = util.promisify(stream.pipeline);

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filePathOnDisk = path.join(__dirname, 'files', pathname);
  // let writeStream;

  // 4. Если в процессе загрузки файла на сервер произошел обрыв соединения —
  // созданный файл с диска надо удалять.
  req.on('close', () => {
    if (req.finished) return;
    if (writeStream) {
      writeStream.destroy();
      fs.unlink(filePathOnDisk, (err) =>{
        if (err) throw err;
      });
    }
  });

  switch (req.method) {
    case 'POST':

      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end('Nested paths are not allowed');
      }

      fs.access(filePathOnDisk, fs.constants.F_OK, (err) => {
        if (!err) {
          res.statusCode = 409;
          res.end('File exist');
          return;
        }

        // finished(req, (err) => {
        //
        // });

        const writeStream = fs.createWriteStream(filePathOnDisk);
        const transformStream = new LimitSizeStream({limit: 1048576});

        finished(transformStream, (err) => {
          // console.log('transform');
          // console.log(err);

          if (err) {
            if (err instanceof LimitExceededError) {
              writeStream.destroy();
              res.statusCode = 413;
              res.end('File is too big.');
            } else {
              res.statusCode = 500;
              res.end('Server error.');
            }
          }
        });

        // finished(writeStream, (err) => {
        //   console.log('write');
        //   console.log(err);
        //
        //   if (err) {
        //     res.statusCode = 500;
        //     res.end('Server error.');
        //   } else {
        //     res.statusCode = 200;
        //     res.end('OK');
        //   }
        // });

        pipeline(
          req,
          transformStream,
          writeStream,
          (err) => {
            // console.log('pipeline');
            // console.log(err);
          }
        );
      });

      // access callback end


      // .then((/*writeStream*/) => {
      //   // writeStream.on('close', () => {
      //   //     removeFileFromDisk(filePathOnDisk);
      //   // });
      //


      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
