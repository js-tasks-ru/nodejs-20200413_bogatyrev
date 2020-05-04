const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const server = new http.Server();

server.on('request', (req, res) => {
  const fileNameFromUrl = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', fileNameFromUrl);

  switch (req.method) {
    case 'DELETE':
      deleteFile(req, res);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

/**
 * Delete file from the files folder.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function deleteFile(req, res) {
  const fileNameFromUrl = url.parse(req.url).pathname.slice(1);
  const filePathOnDisk = path.join(__dirname, 'files', fileNameFromUrl);

  if (isNestedPath(fileNameFromUrl)) {
    res.statusCode = 400;
    res.end('Nested paths are not allowed.');
    return;
  }

  if (await isFileNotExists(filePathOnDisk)) {
    res.statusCode = 404;
    res.end('File does not exist.');
    return;
  }

  await fsPromises.unlink(filePathOnDisk);

  res.statusCode = 200;
  res.end('File deleted.');
}

/**
 * Check if file already exists.
 * @param path
 * @returns {Promise<void>}
 */
function isFileNotExists(path) {
  return fsPromises.access(path, fs.constants.F_OK)
    .then(() => false)
    .catch((err) => (err.code == 'ENOENT'));
}

/**
 * Check if path contains subdirectories.
 * @param path
 * @returns {boolean}
 */
function isNestedPath(path) {
  return (path.includes('/') || path.includes('..'));
}

module.exports = server;
